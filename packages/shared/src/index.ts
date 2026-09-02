/**
 * Constantes e utilitários compartilhados entre servidor e cliente Windows.
 */

export const APP_NAME = "The Center";
export const APP_VERSION = "0.1.0";
export const DEFAULT_SERVER_URL = "http://localhost:3000";
export const API_PREFIX = "/api/v1";
export const CONNECTION_TIMEOUT_MS = 10000;

/**
 * Type guard para verificar se um valor não é null nem undefined.
 * Útil para estreitar tipos em código que processa dados de APIs externas.
 */
export function isNonNullable<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}