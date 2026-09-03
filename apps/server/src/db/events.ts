import { getPool } from './index.js';
import type {
  DigitalEvent,
  EventSource,
  EventType,
  Importance,
} from '@the-center/api-types';

/**
 * Linha crua retornada pelo banco para `digital_events`.
 * Espelha as colunas físicas do schema canônico (002_digital_events_structured).
 */
interface EventRow {
  id: string;
  source: EventSource;
  account: string;
  type: EventType;
  author_name: string;
  author_avatar: string | null;
  timestamp: Date;
  content_title: string | null;
  content_body: string;
  content_url: string | null;
  metadata: unknown;
  importance: Importance;
  read: boolean;
  created_at: Date;
}

/** Limite máximo de itens por requisição de listagem. */
export const MAX_EVENTS_LIMIT = 50;

/** Converte uma linha do banco no DigitalEvent canônico. */
function rowToEvent(row: EventRow): DigitalEvent {
  return {
    id: row.id,
    source: row.source,
    account: row.account,
    type: row.type,
    author: {
      name: row.author_name,
      ...(row.author_avatar != null ? { avatar: row.author_avatar } : {}),
    },
    timestamp: row.timestamp.toISOString(),
    content: {
      ...(row.content_title != null ? { title: row.content_title } : {}),
      body: row.content_body,
      ...(row.content_url != null ? { url: row.content_url } : {}),
    },
    metadata: (row.metadata ?? {}) as Record<string, unknown>,
    importance: row.importance,
    read: row.read,
  };
}

export interface ListEventsOptions {
  limit?: number;
  offset?: number;
}

/**
 * Lista eventos canônicos ordenados por `timestamp DESC`.
 * Aplica limite máximo e sanitiza `limit`/`offset`.
 */
export async function listEvents(options: ListEventsOptions = {}): Promise<{
  items: DigitalEvent[];
}> {
  const pool = getPool();
  const limit = Math.min(
    Math.max(Number.isFinite(options.limit) ? (options.limit as number) : 50, 1),
    MAX_EVENTS_LIMIT,
  );
  const offset = Math.max(
    Number.isFinite(options.offset) ? (options.offset as number) : 0,
    0,
  );

  const { rows } = await pool.query<EventRow>(
    `SELECT id, source, account, type, author_name, author_avatar,
            timestamp, content_title, content_body, content_url,
            metadata, importance, read, created_at
       FROM digital_events
      ORDER BY timestamp DESC
      LIMIT $1 OFFSET $2;`,
    [limit, offset],
  );

  return { items: rows.map(rowToEvent) };
}

export interface CreateEventInput {
  source: EventSource;
  account: string;
  type: EventType;
  author: { name: string; avatar?: string | null };
  timestamp?: string;
  content: { title?: string | null; body: string; url?: string | null };
  metadata?: Record<string, unknown>;
  importance: Importance;
  read?: boolean;
}

/**
 * Insere um DigitalEvent e o retorna no formato canônico.
 * Usado pelo seed/fixture de desenvolvimento.
 */
export async function createEvent(input: CreateEventInput): Promise<DigitalEvent> {
  const pool = getPool();
  const id = crypto.randomUUID();
  const timestamp = input.timestamp ?? new Date().toISOString();

  const { rows } = await pool.query<EventRow>(
    `INSERT INTO digital_events
       (id, source, account, type, author_name, author_avatar,
        timestamp, content_title, content_body, content_url,
        metadata, importance, read)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
     RETURNING id, source, account, type, author_name, author_avatar,
               timestamp, content_title, content_body, content_url,
               metadata, importance, read, created_at;`,
    [
      id,
      input.source,
      input.account,
      input.type,
      input.author.name,
      input.author.avatar ?? null,
      timestamp,
      input.content.title ?? null,
      input.content.body,
      input.content.url ?? null,
      JSON.stringify(input.metadata ?? {}),
      input.importance,
      input.read ?? false,
    ],
  );

  return rowToEvent(rows[0]!);
}
