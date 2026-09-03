import type { DigitalEvent } from "@the-center/api-types";

/**
 * Deriva a contagem de eventos não lidos a partir dos DigitalEvents recebidos.
 * Função pura, sem chamadas de API, facilmente testável.
 */
export function computeUnreadCount(events: DigitalEvent[]): number {
  return events.reduce((count, event) => (event.read ? count : count + 1), 0);
}
