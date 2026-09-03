import { fetch } from "@tauri-apps/plugin-http";
import type {
  EventListResponse,
  DigitalEvent,
  EventSource,
  EventType,
  HealthResponse,
  Importance,
  VersionResponse,
} from "@the-center/api-types";
import {
  ApiError,
  NetworkError,
  TimeoutError,
  ValidationError,
} from "./errors";

const DEFAULT_TIMEOUT_MS = 10_000;

interface RequestOptions {
  timeoutMs?: number;
}

/**
 * A small, isolated HTTP client for communicating with The Center server.
 *
 * Uses the Tauri HTTP plugin (reqwest via Rust) to bypass WebView2 network
 * restrictions that block fetch on Windows.
 */
export class ApiClient {
  constructor(
    private readonly baseUrl: string,
    private readonly timeoutMs = DEFAULT_TIMEOUT_MS,
  ) {}

  private get url(): string {
    return this.baseUrl.replace(/\/+$/, "");
  }

  private async request<T>(
    path: string,
    options: RequestOptions,
    validate: (body: unknown) => T,
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutMs = options.timeoutMs ?? this.timeoutMs;
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(`${this.url}${path}`, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        throw new ApiError(
          `Server responded with HTTP ${response.status}`,
          response.status,
        );
      }

      const raw: unknown = await response.json();
      return validate(raw);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        throw new TimeoutError();
      }
      if (err instanceof ApiError) {
        throw err;
      }
      throw new NetworkError(
        err instanceof Error ? err.message : "Network request failed",
      );
    } finally {
      clearTimeout(timeout);
    }
  }

  async getHealth(options: RequestOptions = {}): Promise<HealthResponse> {
    return this.request(
      "/api/v1/health",
      options,
      validateHealthResponse,
    );
  }

  async getVersion(options: RequestOptions = {}): Promise<VersionResponse> {
    return this.request(
      "/api/v1/version",
      options,
      validateVersionResponse,
    );
  }

  async getEvents(
    options: RequestOptions & { limit?: number; offset?: number } = {},
  ): Promise<EventListResponse> {
    const { timeoutMs, limit, offset } = options;
    const params = new URLSearchParams();
    if (limit !== undefined) params.set("limit", String(limit));
    if (offset !== undefined) params.set("offset", String(offset));
    const qs = params.toString();
    return this.request(
      `/api/v1/events${qs ? `?${qs}` : ""}`,
      { timeoutMs },
      validateEventListResponse,
    );
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validateHealthResponse(body: unknown): HealthResponse {
  if (!isRecord(body)) {
    throw new ValidationError("Invalid health response: not an object");
  }
  const { status, timestamp, uptime, startedAt } = body;
  if (status !== "ok" && status !== "degraded" && status !== "down") {
    throw new ValidationError(
      "Invalid health response: status must be 'ok', 'degraded' or 'down'",
    );
  }
  if (typeof timestamp !== "string" || !timestamp) {
    throw new ValidationError(
      "Invalid health response: timestamp must be a non-empty string",
    );
  }
  if (uptime !== undefined && typeof uptime !== "number") {
    throw new ValidationError("Invalid health response: uptime must be a number");
  }
  if (startedAt !== undefined && typeof startedAt !== "string") {
    throw new ValidationError("Invalid health response: startedAt must be a string");
  }
  return {
    status,
    timestamp,
    ...(uptime !== undefined ? { uptime } : {}),
    ...(startedAt !== undefined ? { startedAt } : {}),
  };
}

function validateVersionResponse(body: unknown): VersionResponse {
  if (!isRecord(body)) {
    throw new ValidationError("Invalid version response: not an object");
  }
  const { version, name } = body;
  if (typeof version !== "string" || !version) {
    throw new ValidationError("Invalid version response: version must be a non-empty string");
  }
  if (name !== "the-center-server") {
    throw new ValidationError(
      "Invalid version response: name must be 'the-center-server'",
    );
  }
  return { version, name };
}

const EVENT_SOURCES: EventSource[] = [
  "gmail",
  "instagram",
  "discord",
  "youtube",
  "github",
  "server",
  "system",
];

const EVENT_TYPES: EventType[] = [
  "message",
  "notification",
  "alert",
  "update",
  "error",
  "info",
];

const IMPORTANCES: Importance[] = ["low", "medium", "high", "critical"];

function validateEventListResponse(body: unknown): EventListResponse {
  if (!isRecord(body)) {
    throw new ValidationError("Invalid events response: not an object");
  }
  if (!Array.isArray(body.items)) {
    throw new ValidationError("Invalid events response: items must be an array");
  }
  return {
    items: body.items.map((item, i) => validateEvent(item, i)),
  };
}

function validateEvent(value: unknown, index: number): DigitalEvent {
  if (!isRecord(value)) {
    throw new ValidationError(`Invalid event at index ${index}: not an object`);
  }
  const {
    id,
    source,
    account,
    type,
    author,
    timestamp,
    content,
    metadata,
    importance,
    read,
  } = value;

  if (typeof id !== "string" || !id) {
    throw new ValidationError(`Invalid event at index ${index}: id must be a non-empty string`);
  }
  if (typeof source !== "string" || !EVENT_SOURCES.includes(source as EventSource)) {
    throw new ValidationError(`Invalid event at index ${index}: source is invalid`);
  }
  if (typeof account !== "string") {
    throw new ValidationError(`Invalid event at index ${index}: account must be a string`);
  }
  if (typeof type !== "string" || !EVENT_TYPES.includes(type as EventType)) {
    throw new ValidationError(`Invalid event at index ${index}: type is invalid`);
  }
  if (typeof timestamp !== "string" || !timestamp) {
    throw new ValidationError(`Invalid event at index ${index}: timestamp must be a non-empty string`);
  }
  if (typeof importance !== "string" || !IMPORTANCES.includes(importance as Importance)) {
    throw new ValidationError(`Invalid event at index ${index}: importance is invalid`);
  }
  if (typeof read !== "boolean") {
    throw new ValidationError(`Invalid event at index ${index}: read must be a boolean`);
  }
  if (!isRecord(content) || typeof content.body !== "string") {
    throw new ValidationError(`Invalid event at index ${index}: content.body must be a string`);
  }

  return {
    id,
    source: source as EventSource,
    account,
    type: type as EventType,
    author: validateEventAuthor(author, index),
    timestamp,
    content: {
      ...(content.title != null ? { title: content.title as string } : {}),
      body: content.body as string,
      ...(content.url != null ? { url: content.url as string } : {}),
    },
    metadata: (isRecord(metadata) ? metadata : {}) as Record<string, unknown>,
    importance: importance as Importance,
    read: read as boolean,
  };
}

function validateEventAuthor(
  value: unknown,
  index: number,
): { name: string; avatar?: string | null } {
  if (!isRecord(value) || typeof value.name !== "string") {
    throw new ValidationError(`Invalid event at index ${index}: author.name must be a string`);
  }
  return {
    name: value.name,
    ...(value.avatar != null ? { avatar: value.avatar as string } : {}),
  };
}
