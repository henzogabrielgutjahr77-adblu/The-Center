import type { HealthResponse, VersionResponse } from "@the-center/api-types";
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
 * It centralizes error handling (network, timeout, non-2xx, invalid body)
 * so that `fetch()` is never spread across the React components.
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
