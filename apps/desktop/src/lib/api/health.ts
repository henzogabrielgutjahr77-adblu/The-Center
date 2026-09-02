import type { HealthResponse } from "@the-center/api-types";
import { ApiClient } from "./client";
import { getServerUrl } from "./config";

/**
 * Performs the server health check.
 *
 * The URL is resolved from VITE_SERVER_URL (config layer) and the request is
 * executed through the shared ApiClient. No persistent state is stored here.
 */
export async function checkHealth(
  serverUrl = getServerUrl(),
): Promise<HealthResponse> {
  const client = new ApiClient(serverUrl);
  return client.getHealth();
}
