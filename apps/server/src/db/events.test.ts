import { test, before, after, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createPool, closePool, getPool } from './index.js';
import { createEvent, listEvents } from './events.js';
import type { DigitalEvent } from '@the-center/api-types';

/**
 * Testes de integração do repository de eventos contra o PostgreSQL real.
 *
 * Só executam quando DATABASE_URL está definido no ambiente (ex.: servidor de
 * dev com o banco Docker rodando). Sem banco a suíte é pulada silenciosamente,
 * mantendo `pnpm -r test` verde em ambientes sem PostgreSQL.
 */

const dbUrl = process.env.DATABASE_URL;

function makeEvent(overrides: Partial<Parameters<typeof createEvent>[0]>) {
  return createEvent({
    source: 'system',
    account: 'test',
    type: 'info',
    author: { name: 'Repository Test', avatar: null },
    timestamp: new Date().toISOString(),
    content: { body: 'test event' },
    metadata: {},
    importance: 'medium',
    read: false,
    ...overrides,
  });
}

if (dbUrl) {
  describe('repository de eventos (integração com PostgreSQL)', () => {
    const cleanupIds: string[] = [];

    before(async () => {
      createPool(dbUrl!);
      try {
        await getPool().query('SELECT 1;');
      } catch (err) {
        throw new Error(`Banco de testes inacessível; rode o PostgreSQL (docker compose dev). Causa: ${err}`);
      }
    });

    after(async () => {
      const pool = getPool();
      if (cleanupIds.length > 0) {
        await pool.query('DELETE FROM digital_events WHERE id = ANY($1::text[]);', [cleanupIds]);
      }
      await closePool();
    });

    async function track(ev: DigitalEvent): Promise<DigitalEvent> {
      cleanupIds.push(ev.id);
      return ev;
    }

    test('cria evento e retorna no formato canônico', async () => {
      const created = await track(
        await makeEvent({
          account: 'order-test',
          content: { title: 'Título', body: 'corpo', url: 'https://example.com/a' },
          importance: 'high',
          read: true,
        }),
      );

      assert.equal(created.author.name, 'Repository Test');
      assert.equal(created.importance, 'high');
      assert.equal(created.read, true);
      assert.equal(created.content.url, 'https://example.com/a');
    });

    test('retorna eventos ordenados por timestamp decrescente', async () => {
      const older = await track(
        await makeEvent({
          account: 'order-test',
          timestamp: '2026-01-01T00:00:00.000Z',
          content: { body: 'older' },
        }),
      );
      const newer = await track(
        await makeEvent({
          account: 'order-test',
          timestamp: '2026-09-01T00:00:00.000Z',
          content: { body: 'newer' },
        }),
      );

      const { items } = await listEvents({ limit: 100, offset: 0 });
      const idxOfOlder = items.findIndex((e) => e.id === older.id);
      const idxOfNewer = items.findIndex((e) => e.id === newer.id);
      assert.notEqual(idxOfOlder, -1);
      assert.notEqual(idxOfNewer, -1);
      assert.ok(idxOfNewer < idxOfOlder, 'evento mais recente deve vir antes');
    });

    test('aplica limit corretamente', async () => {
      await track(await makeEvent({ account: 'limit-test', content: { body: 'a' } }));
      await track(await makeEvent({ account: 'limit-test', content: { body: 'b' } }));
      await track(await makeEvent({ account: 'limit-test', content: { body: 'c' } }));

      const { items } = await listEvents({ limit: 2, offset: 0 });
      assert.equal(items.length, 2);
    });

    test('aplica offset corretamente', async () => {
      const all = await listEvents({ limit: 50, offset: 0 });
      const page2 = await listEvents({ limit: 50, offset: 3 });
      assert.ok(page2.items.length <= all.items.length - 3 + 1);
    });

    test('retorna lista vazia para um offset além dos registros', async () => {
      // Offset muito maior que qualquer quantidade razoável de registros de teste
      // -> a listagem deve vir vazia.
      const { items } = await listEvents({ limit: 50, offset: 1_000_000 });
      assert.equal(items.length, 0);
    });
  });
}
