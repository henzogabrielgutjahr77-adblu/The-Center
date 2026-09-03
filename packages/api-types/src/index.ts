/**
 * DigitalEvent - a unidade normalizada de informação do The Center.
 *
 * Qualquer integração externa (Gmail, Instagram, Discord, YouTube, GitHub, IA,
 * etc.) deverá transformar seus dados brutos em um DigitalEvent. O servidor é a
 * fonte de verdade e o cliente Windows consome estes eventos de forma consistente.
 *
 * NOTA: Nenhuma integração é implementada ainda. Estes tipos são apenas o contrato
 * inicial que será usado por futuras integrações, agentes (SocialAgent/ServerAgent)
 * e pelo cliente Windows.
 */

/**
 * Origem de um DigitalEvent.
 * União de valores conhecidos para type-safety. Extensível conforme integrações.
 */
export type EventSource =
  | "gmail"
  | "instagram"
  | "discord"
  | "youtube"
  | "github"
  | "server"
  | "system";

/**
 * Alias para compatibilidade com código que usa string extensível.
 * @deprecated Use EventSource para type-safety.
 */
export type DigitalEventSource = string;

/**
 * Conta associada (ex.: e-mail, handle, canal) dentro da origem.
 */
export type DigitalEventAccount = string;

/**
 * Tipo normalizado do evento.
 * União de valores conhecidos para type-safety.
 */
export type EventType =
  | "message"
  | "notification"
  | "alert"
  | "update"
  | "error"
  | "info";

/**
 * Alias para compatibilidade com código que usa string extensível.
 * @deprecated Use EventType para type-safety.
 */
export type DigitalEventType = string;

/**
 * Nível de importância do evento para o usuário.
 */
export type Importance = "low" | "medium" | "high" | "critical";

/**
 * Alias para compatibilidade.
 * @deprecated Use Importance para type-safety.
 */
export type DigitalEventImportance = Importance;

/**
 * Metadados opcionais e semi-estruturados específicos da origem.
 */
export type DigitalEventMetadata = Record<string, unknown>;

/**
 * Identificador global estável do evento.
 */
export type DigitalEventId = string;

/**
 * Unidade normalizada de informação do The Center.
 *
 * Compartilhado entre servidor (@the-center/api-types) e cliente
 * Windows via o mesmo pacote.
 */
export interface DigitalEvent {
  /** Identificador global estável. */
  id: DigitalEventId;
  /** Origem do evento (ex.: 'gmail', 'discord', 'instagram'). */
  source: EventSource;
  /** Conta associada dentro da origem (e-mail, handle, canal). */
  account: DigitalEventAccount;
  /** Tipo normalizado do evento. */
  type: EventType;
  /** Autor/pessoa ou entidade que originou o conteúdo. */
  author: {
    name: string;
    avatar?: string | null;
  };
  /** Timestamp ISO-8601 de quando o evento ocorreu (UTC). */
  timestamp: string;
  /** Conteúdo principal do evento. */
  content: {
    title?: string | null;
    body: string;
    url?: string | null;
  };
  /** Metadados opcionais específicos da origem. */
  metadata: DigitalEventMetadata;
  /** Nível de importância. */
  importance: Importance;
  /** Flag de leitura controlada pelo usuário. */
  read: boolean;
}

/**
 * Resposta de GET /health e GET /api/v1/health.
 * Indica que o servidor está ativo e respondendo.
 */
export interface HealthResponse {
  /**
   * 'ok' - servidor saudável.
   * 'degraded' - servidor respondendo, mas uma dependência (ex.: PostgreSQL)
   * não está acessível.
   * 'down' - servidor indisponível.
   */
  status: "ok" | "degraded" | "down";
  /** Timestamp ISO-8601 (UTC) do momento da resposta. */
  timestamp: string;
  /** Uptime em segundos (opcional). */
  uptime?: number;
  /** Momento em que o servidor iniciou, formato ISO-8601 (UTC). */
  startedAt?: string;
}

/**
 * Resposta de GET /version e GET /api/v1/version.
 * Identifica o nome e a versão do servidor.
 */
export interface VersionResponse {
  name: "the-center-server";
  version: string;
}

/**
 * Resposta de erro estruturada (JSON), usada pelo servidor em casos de falha.
 * Compartilhada para que o cliente possa tipar respostas de erro de forma
 * consistente com o middleware de tratamento de erros.
 */
export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}

/**
 * Resposta de GET /api/v1/events.
 * Lista de DigitalEvents canônicos, ordenados por timestamp (decrescente).
 */
export interface EventListResponse {
  items: DigitalEvent[];
}