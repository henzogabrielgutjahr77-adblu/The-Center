import dotenv from 'dotenv';
import { resolve } from 'node:path';
import { loadConfig } from '../config.js';
import { createPool, closePool, getPool } from './index.js';
import { createEvent } from './events.js';
import { logger } from '../logger.js';

// Carrega o .env da raiz do monorepo, independente do cwd (workspace).
dotenv.config({ path: resolve(import.meta.dirname, '../../../../.env') });

/**
 * Seed de desenvolvimento: insere um primeiro DigitalEvent real no PostgreSQL
 * para validar o pipeline PostgreSQL -> API -> Desktop.
 *
 * É idempotente: se o evento "servidor online" já existir, não duplica.
 *
 * Uso:
 *   pnpm --filter @the-center/server seed
 */

async function alreadySeeded(): Promise<boolean> {
  const pool = getPool();
  const { rows } = await pool.query<{ n: string }>(
    `SELECT count(*)::text AS n
       FROM digital_events
      WHERE source = 'system'
        AND account = 'development'
        AND type = 'info'
        AND content_body = 'The Center server is online';`,
  );
  return Number(rows[0]?.n ?? 0) > 0;
}

async function main(): Promise<void> {
  const config = loadConfig();
  createPool(config.DATABASE_URL);

  try {
    if (await alreadySeeded()) {
      logger.info('evento de desenvolvimento já presente; seed ignorado');
      return;
    }

    const event = await createEvent({
      source: 'system',
      account: 'development',
      type: 'info',
      author: { name: 'The Center', avatar: null },
      content: {
        title: 'Servidor online',
        body: 'The Center server is online',
        url: null,
      },
      importance: 'medium',
      read: false,
      metadata: {},
    });

    logger.info({ id: event.id, timestamp: event.timestamp }, 'evento de desenvolvimento inserido');
  } finally {
    await closePool();
  }
}

main().catch((err) => {
  logger.error({ err }, 'seed falhou');
  process.exitCode = 1;
});
