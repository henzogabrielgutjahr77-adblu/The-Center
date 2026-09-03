import type { EventListResponse } from "@the-center/api-types";
import { ApiClient } from "./client";
import { getServerUrl } from "./config";

/**
 * Busca a lista de DigitalEvents canônicos junto ao servidor.
 * A URL é resolvida de VITE_SERVER_URL (config layer) e a requisição passa
 * pela camada ApiClient (timeout + validação). Nenhum estado persistente aqui.
 */
export async function fetchEvents(
  serverUrl = getServerUrl(),
  options: { limit?: number; offset?: number } = {},
): Promise<EventListResponse> {
  const client = new ApiClient(serverUrl);
  return client.getEvents(options);
}
