import { test, before, after, describe } from 'node:test';
import assert from 'node:assert/strict';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import type { DigitalEvent } from '@the-center/api-types';
import { createApp } from './app.js';

const TAURI_ORIGIN = 'http://tauri.localhost';
const ARBITRARY_ORIGIN = 'http://example.invalid';

const fakeEvent: DigitalEvent = {
  id: 'evt-001',
  source: 'system',
  account: 'development',
  type: 'info',
  author: { name: 'The Center', avatar: null },
  timestamp: '2026-09-02T12:00:00.000Z',
  content: { title: 'Servidor online', body: 'The Center server is online', url: null },
  metadata: {},
  importance: 'medium',
  read: false,
};

describe('CORS restritivo', () => {
  let server: Server;
  let baseUrl: string;

  before(async () => {
    const listEventsMock = async (opts: { limit?: number; offset?: number } = {}) => {
      return { items: [fakeEvent], limit: opts.limit, offset: opts.offset };
    };
    const app = createApp({
      serviceDeps: { healthCheck: async () => true },
      eventsDeps: { listEvents: listEventsMock as never },
    });
    server = app.listen(0);
    await new Promise<void>((resolve) => server.once('listening', resolve));
    const addr = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${addr.port}`;
  });

  after(() => new Promise<void>((resolve) => server.close(() => resolve())));

  test('origem do Tauri recebe Access-Control-Allow-Origin refletida', async () => {
    const res = await fetch(`${baseUrl}/api/v1/health`, {
      headers: { Origin: TAURI_ORIGIN },
    });
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('access-control-allow-origin'), TAURI_ORIGIN);
    assert.equal(res.headers.get('access-control-allow-credentials'), null);
  });

  test('origem arbitrária NÃO recebe autorização CORS', async () => {
    const res = await fetch(`${baseUrl}/api/v1/health`, {
      headers: { Origin: ARBITRARY_ORIGIN },
    });
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('access-control-allow-origin'), null);
  });

  test('preflight OPTIONS do Tauri responde com headers CORS', async () => {
    const res = await fetch(`${baseUrl}/api/v1/health`, {
      method: 'OPTIONS',
      headers: {
        Origin: TAURI_ORIGIN,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Accept',
      },
    });
    assert.equal(res.status, 204);
    assert.equal(res.headers.get('access-control-allow-origin'), TAURI_ORIGIN);
    assert.equal(res.headers.get('access-control-allow-methods'), 'GET, HEAD, OPTIONS');
    assert.equal(res.headers.get('access-control-allow-headers'), 'Accept');
    assert.equal(res.headers.get('access-control-allow-credentials'), null);
  });

  test('/api/v1/health continua 200 com origem do Tauri', async () => {
    const res = await fetch(`${baseUrl}/api/v1/health`, {
      headers: { Origin: TAURI_ORIGIN },
    });
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('access-control-allow-origin'), TAURI_ORIGIN);
    const body = (await res.json()) as { status: string };
    assert.equal(body.status, 'ok');
  });

  test('/api/v1/events continua 200 e retorna eventos com origem do Tauri', async () => {
    const res = await fetch(`${baseUrl}/api/v1/events?limit=3`, {
      headers: { Origin: TAURI_ORIGIN },
    });
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('access-control-allow-origin'), TAURI_ORIGIN);
    const body = (await res.json()) as { items: unknown[] };
    assert.ok(Array.isArray(body.items));
    assert.equal(body.items.length, 1);
  });

  test('resposta sem Origin não inclui header de CORS', async () => {
    const res = await fetch(`${baseUrl}/api/v1/health`);
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('access-control-allow-origin'), null);
  });
});
