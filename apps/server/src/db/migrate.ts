import dotenv from 'dotenv';
import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

// Carrega o .env da raiz do monorepo, independente do cwd (workspace npm).
dotenv.config({ path: resolve(import.meta.dirname, '../../../../.env') });
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Pool } from 'pg';
import { logger } from '../logger.js';
import { loadConfig } from '../config.js';

/**
 * Runner de migrations versionadas, simples e previsível.
 *
 * Aplica arquivos `NNN_nome.up.sql` em ordem alfabética e registra as aplicadas
 * na tabela `schema_migrations`. Para reverter, execute com `down` para
 * aplicar os arquivos `.down.sql` na ordem inversa.
 *
 * Uso:
 *   npm run migrate         # aplicar todas as pendentes (up)
 *   npm run migrate -- down # reverter a última aplicada (down)
 */

const migrationsDir = join(dirname(fileURLToPath(import.meta.url)), 'migrations');

const KNOWN_FILES = new Set([
  '001_initial_schema.up.sql',
  '001_initial_schema.down.sql',
]);

export interface MigrationRecord {
  name: string;
  applied_at: Date;
}

async function listMigrationNames(): Promise<string[]> {
  const files = await readdir(migrationsDir);
  const names = files
    .filter((f) => f.endsWith('.up.sql'))
    .map((f) => f.replace(/\.up\.sql$/, ''))
    .sort();

  for (const name of names) {
    const base = `${name}.up.sql`;
    if (!KNOWN_FILES.has(base)) {
      throw new Error(
        `Migration '${base}' não registrada no KNOWN_FILES. Adicione-a antes de prosseguir.`,
      );
    }
  }

  return names;
}

async function ensureMigrationsTable(pool: Pool): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name       TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

async function getApplied(pool: Pool): Promise<Set<string>> {
  const { rows } = await pool.query<MigrationRecord>(
    'SELECT name FROM schema_migrations;',
  );
  return new Set(rows.map((r) => r.name));
}

async function runUp(pool: Pool): Promise<void> {
  const names = await listMigrationNames();
  const applied = await getApplied(pool);
  const pending = names.filter((n) => !applied.has(n));

  if (pending.length === 0) {
    logger.info('nenhuma migration pendente');
    return;
  }

  for (const name of pending) {
    const sql = await readFile(join(migrationsDir, `${name}.up.sql`), 'utf8');
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query(
        'INSERT INTO schema_migrations (name) VALUES ($1);',
        [name],
      );
      await client.query('COMMIT');
      logger.info({ migration: name }, 'migration aplicada');
    } catch (err) {
      await client.query('ROLLBACK');
      logger.error({ err, migration: name }, 'falha ao aplicar migration');
      throw err;
    } finally {
      client.release();
    }
  }
}

async function runDown(pool: Pool): Promise<void> {
  const names = await listMigrationNames();
  const applied = await getApplied(pool);
  const appliedInOrder = names.filter((n) => applied.has(n));

  if (appliedInOrder.length === 0) {
    logger.info('nenhuma migration para reverter');
    return;
  }

  const last = appliedInOrder[appliedInOrder.length - 1]!;
  const sql = await readFile(join(migrationsDir, `${last}.down.sql`), 'utf8');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('DELETE FROM schema_migrations WHERE name = $1;', [last]);
    await client.query('COMMIT');
    logger.info({ migration: last }, 'migration revertida');
  } catch (err) {
    await client.query('ROLLBACK');
    logger.error({ err, migration: last }, 'falha ao reverter migration');
    throw err;
  } finally {
    client.release();
  }
}

async function main(): Promise<void> {
  const config = loadConfig();
  const pool = new Pool({ connectionString: config.DATABASE_URL });

  try {
    await ensureMigrationsTable(pool);
    const direction = process.argv[2]?.toLowerCase();
    if (direction === 'down') {
      await runDown(pool);
    } else {
      await runUp(pool);
    }
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  logger.error({ err }, 'migrate falhou');
  process.exitCode = 1;
});
