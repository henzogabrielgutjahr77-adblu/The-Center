import { test, before, after, describe } from 'node:test';
import assert from 'node:assert/strict';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import type { DigitalEvent, EventListResponse } from '@the-center/api-types';
import { createApp } from '../app.js';

const fakeEvent: DigitalEvent = {
  id: 'evt-001',
  source: 'system',
  account: 'development',
  type: 'info',
  author: { name: 'The Center', avatar: null },
  timestamp: '2026-09-02T12:00:00.000Z',
  content: {
    title: 'Servidor online',
    body: 'The Center server is online',
    url: null,
  },
  metadata: {},
  importance: 'medium',
  read: false,
};

describe('API de eventos', () => {
  let server: Server;
  let baseUrl: string;

  before(async () => {
    const listEventsMock = async (opts: { limit?: number; offset?: number } = {}) => {
      return { items: [fakeEvent], limit: opts.limit, offset: opts.offset };
    };
    const app = createApp({
      eventsDeps: { listEvents: listEventsMock as never },
    });
    server = app.listen(0);
    await new Promise<void>((resolve) => server.once('listening', resolve));
    const addr = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${addr.port}`;
  });

  after(() => new Promise<void>((resolve) => server.close(() => resolve())));

  test('GET /api/v1/events retorna 200 com lista canônica', async () => {
    const res = await fetch(`${baseUrl}/api/v1/events`);
    assert.equal(res.status, 200);
    const body = (await res.json()) as EventListResponse;
    assert.ok(Array.isArray(body.items));
    assert.equal(body.items.length, 1);
    assert.deepEqual(body.items[0], fakeEvent);
  });

  test('GET /api/v1/events sem prefixo /api/v1 retorna 404', async () => {
    const res = await fetch(`${baseUrl}/events`);
    assert.equal(res.status, 404);
  });

  test('GET /api/v1/events repassa limit e offset', async () => {
    let captured: { limit?: number; offset?: number } | undefined;
    const listEventsMock = async (opts: { limit?: number; offset?: number } = {}) => {
      captured = opts;
      return { items: [] };
    };
    const app = createApp({
      eventsDeps: { listEvents: listEventsMock as never },
    });
    const s = app.listen(0);
    await new Promise<void>((resolve) => s.once('listening', resolve));
    const a = s.address() as AddressInfo;
    const res = await fetch(`http://127.0.0.1:${a.port}/api/v1/events?limit=10&offset=20`);
    assert.equal(res.status, 200);
    assert.equal(captured?.limit, 10);
    assert.equal(captured?.offset, 20);
    await new Promise<void>((resolve) => s.close(() => resolve()));
  });

  test('GET /api/v1/events retorna 500 quando a consulta falha', async () => {
    const listEventsMock = async () => {
      throw new Error('db down');
    };
    const app = createApp({
      eventsDeps: { listEvents: listEventsMock as never },
    });
    const s = app.listen(0);
    await new Promise<void>((resolve) => s.once('listening', resolve));
    const a = s.address() as AddressInfo;
    const res = await fetch(`http://127.0.0.1:${a.port}/api/v1/events`);
    assert.equal(res.status, 500);
    await new Promise<void>((resolve) => s.close(() => resolve()));
  });
});
