import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ApiClient } from "./client";
import {
  ApiError,
  NetworkError,
  TimeoutError,
  ValidationError,
} from "./errors";

function mockFetch(
  impl: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>,
) {
  globalThis.fetch = vi.fn(impl) as unknown as typeof fetch;
}

function jsonResponse(body: unknown, status = 200, ok = status < 400): Response {
  return {
    ok,
    status,
    json: () => Promise.resolve(body),
  } as Response;
}

describe("ApiClient.getHealth", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("returns the health response for a valid server", async () => {
    mockFetch(() =>
      Promise.resolve(
        jsonResponse({
          status: "ok",
          timestamp: "2026-09-02T12:00:00Z",
          uptime: 42,
          startedAt: "2026-09-02T11:59:18Z",
        }),
      ),
    );

    const client = new ApiClient("http://server:3000");
    const result = await client.getHealth();

    expect(result).toEqual({
      status: "ok",
      timestamp: "2026-09-02T12:00:00Z",
      uptime: 42,
      startedAt: "2026-09-02T11:59:18Z",
    });
  });

  it("throws a NetworkError when the server is unreachable", async () => {
    mockFetch(() => Promise.reject(new TypeError("fetch failed")));

    const client = new ApiClient("http://unreachable:3000");
    await expect(client.getHealth()).rejects.toBeInstanceOf(NetworkError);
  });

  it("throws a TimeoutError when the request times out", async () => {
    mockFetch(
      (_input, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () =>
            reject(new DOMException("Aborted", "AbortError")),
          );
        }),
    );

    const client = new ApiClient("http://slow:3000", 5000);
    const assertion = expect(client.getHealth()).rejects.toBeInstanceOf(
      TimeoutError,
    );

    await vi.advanceTimersByTimeAsync(5000);

    await assertion;
  });

  it("throws an ApiError with the status code on HTTP 500", async () => {
    mockFetch(() => Promise.resolve(jsonResponse({}, 500)));

    const client = new ApiClient("http://server:3000");
    const promise = client.getHealth();

    await expect(promise).rejects.toBeInstanceOf(ApiError);
    await expect(promise).rejects.toMatchObject({ status: 500 });
  });

  it("throws a ValidationError for an invalid response body", async () => {
    mockFetch(() =>
      Promise.resolve(jsonResponse({ status: "unexpected-value" })),
    );

    const client = new ApiClient("http://server:3000");
    await expect(client.getHealth()).rejects.toBeInstanceOf(ValidationError);
  });

  it("throws a ValidationError for a non-object response body", async () => {
    mockFetch(() => Promise.resolve(jsonResponse("not-an-object")));

    const client = new ApiClient("http://server:3000");
    await expect(client.getHealth()).rejects.toBeInstanceOf(ValidationError);
  });
});

describe("ApiClient.getVersion", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("returns the version response for a valid server", async () => {
    mockFetch(() =>
      Promise.resolve(
        jsonResponse({ name: "the-center-server", version: "0.1.0" }),
      ),
    );

    const client = new ApiClient("http://server:3000");
    const result = await client.getVersion();

    expect(result).toEqual({ name: "the-center-server", version: "0.1.0" });
  });

  it("throws a ValidationError when name is missing", async () => {
    mockFetch(() => Promise.resolve(jsonResponse({ version: "0.1.0" })));

    const client = new ApiClient("http://server:3000");
    await expect(client.getVersion()).rejects.toBeInstanceOf(ValidationError);
  });

  it("throws a ValidationError when name is incorrect", async () => {
    mockFetch(() =>
      Promise.resolve(jsonResponse({ name: "some-other-server", version: "0.1.0" })),
    );

    const client = new ApiClient("http://server:3000");
    await expect(client.getVersion()).rejects.toBeInstanceOf(ValidationError);
  });

  it("throws a ValidationError when name is empty", async () => {
    mockFetch(() => Promise.resolve(jsonResponse({ name: "", version: "0.1.0" })));

    const client = new ApiClient("http://server:3000");
    await expect(client.getVersion()).rejects.toBeInstanceOf(ValidationError);
  });

  it("throws a ValidationError when version is missing", async () => {
    mockFetch(() =>
      Promise.resolve(jsonResponse({ name: "the-center-server" })),
    );

    const client = new ApiClient("http://server:3000");
    await expect(client.getVersion()).rejects.toBeInstanceOf(ValidationError);
  });
});
