/**
 * Contrato de respostas da API HTTP do The Center.
 *
 * Estes tipos são compartilhados com o cliente Windows através de
 * @the-center/api-types. O formato NÃO deve ser alterado silenciosamente após
 * definido (ver docs/API.md).
 */

/**
 * Resposta de GET /health e GET /api/v1/health.
 * Indica que o servidor está ativo e respondendo.
 */
export interface HealthResponse {
  /**
   * 'ok' - servidor saudável.
   * 'degraded' - servidor respondendo, mas uma dependência (ex.: PostgreSQL)
   * não está acessível.
   */
  status: 'ok' | 'degraded';
  /** Uptime em segundos. */
  uptime?: number;
  /** Momento em que o servidor iniciou, formato ISO-8601 (UTC). */
  startedAt?: string;
}

/**
 * Resposta de GET /version e GET /api/v1/version.
 * Identifica o nome e a versão do servidor.
 */
export interface VersionResponse {
  name: 'the-center-server';
  version: string;
}

/**
 * Erro padronizado retornado pela API.
 * Estrutura consistente para qualquer falha tratada.
 */
export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}
