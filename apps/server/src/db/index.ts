import { Pool } from 'pg';
import { logger } from '../logger.js';

/**
 * Conexão PostgreSQL tipada via pool do `pg`.
 * A string de conexão vem de DATABASE_URL (ver .env.example).
 */

let pool: Pool | null = null;

export function createPool(databaseUrl: string): Pool {
  pool = new Pool({
    connectionString: databaseUrl,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
    // NUNCA logar credenciais da URL de conexão.
    application_name: 'the-center-server',
  });

  pool.on('error', (err) => {
    logger.error({ err }, 'erro inesperado no pool do PostgreSQL');
  });

  return pool;
}

export function getPool(): Pool {
  if (!pool) {
    throw new Error(
      'Pool do PostgreSQL não inicializada. Chame createPool(databaseUrl) primeiro.',
    );
  }
  return pool;
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

export async function pingDatabase(): Promise<boolean> {
  try {
    const db = getPool();
    const { rows } = await db.query<{ ok: string }>(
      "SELECT 'ok' AS ok;",
    );
    return rows[0]?.ok === 'ok';
  } catch (err) {
    logger.error({ err }, 'health check do banco falhou');
    return false;
  }
}
