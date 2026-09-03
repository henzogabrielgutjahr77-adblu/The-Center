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
 * Livre para futuro refinamento (gmail, instagram, discord, youtube, github, ia, ...).
 */
export type DigitalEventSource = string;

/**
 * Conta associada (ex.: e-mail, handle, canal) dentro da origem.
 */
export type DigitalEventAccount = string;

/**
 * Tipo normalizado do evento (ex.: 'message', 'mention', 'post', 'notification').
 * Extensível conforme as integrações forem adicionadas.
 */
export type DigitalEventType = string;

/**
 * Nível de importância do evento para o usuário.
 */
export type DigitalEventImportance = 'low' | 'medium' | 'high' | 'critical';

/**
 * Metadados opcionais e semi-estruturados específicos da origem.
 * Mantidos sem tipagem rígida para acomodar formatos heterogêneos das integrações.
 */
export type DigitalEventMetadata = Record<string, unknown>;

/**
 * Identificador global estável do evento.
 * Formatos podem variar por integração, por isso é uma string.
 */
export type DigitalEventId = string;

/**
 * Unidade normalizada de informação do The Center.
 *
 * Compartilhado entre servidor (@the-center/api-types) e, no futuro, o cliente
 * Windows via o mesmo pacote.
 */
export interface DigitalEvent {
  /** Identificador global estável. */
  id: DigitalEventId;
  /** Origem do evento (ex.: 'gmail', 'discord', 'instagram'). */
  source: DigitalEventSource;
  /** Conta associada dentro da origem (e-mail, handle, canal). */
  account: DigitalEventAccount;
  /** Tipo normalizado do evento. */
  type: DigitalEventType;
  /** Autor/pessoa ou entidade que originou o conteúdo. */
  author: string | null;
  /** Timestamp ISO-8601 de quando o evento ocorreu (UTC). */
  timestamp: string;
  /** Conteúdo principal do evento. */
  content: string;
  /** Metadados opcionais específicos da origem. */
  metadata: DigitalEventMetadata;
  /** Nível de importância. */
  importance: DigitalEventImportance;
  /** Flag de leitura controlada pelo usuário. */
  read: boolean;
}
