import { test, before, after, describe } from 'node:test';
import assert from 'node:assert/strict';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import type { HealthResponse, VersionResponse } from '@the-center/api-types';
import { createApp } from '../app.js';

describe('API de serviço (health/version)', () => {
  let server: Server;
  let baseUrl: string;

  before(async () => {
    const app = createApp({
      serviceDeps: { healthCheck: async () => true },
    });
    server = app.listen(0);
    await new Promise<void>((resolve) => server.once('listening', resolve));
    const addr = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${addr.port}`;
  });

  after(() => new Promise<void>((resolve) => server.close(() => resolve())));

  test('GET /health retorna 200 com status ok', async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.equal(res.status, 200);
    const body = (await res.json()) as HealthResponse;
    assert.equal(body.status, 'ok');
  });

  test('GET /version retorna 200 com nome e versão', async () => {
    const res = await fetch(`${baseUrl}/version`);
    assert.equal(res.status, 200);
    const body = (await res.json()) as VersionResponse;
    assert.equal(body.name, 'the-center-server');
    assert.equal(body.version, '0.1.0');
  });

  test('GET /api/v1/health retorna 200', async () => {
    const res = await fetch(`${baseUrl}/api/v1/health`);
    assert.equal(res.status, 200);
    const body = (await res.json()) as HealthResponse;
    assert.equal(body.status, 'ok');
  });

  test('GET /api/v1/version retorna 200', async () => {
    const res = await fetch(`${baseUrl}/api/v1/version`);
    assert.equal(res.status, 200);
    const body = (await res.json()) as VersionResponse;
    assert.equal(body.name, 'the-center-server');
  });

  test('GET /health retorna 503 quando o banco está indisponível', async () => {
    const degradedApp = createApp({
      serviceDeps: { healthCheck: async () => false },
    });
    const degradedServer = degradedApp.listen(0);
    await new Promise<void>((resolve) =>
      degradedServer.once('listening', resolve),
    );
    const addr = degradedServer.address() as AddressInfo;
    const res = await fetch(`http://127.0.0.1:${addr.port}/health`);
    assert.equal(res.status, 503);
    await new Promise<void>((resolve) => degradedServer.close(() => resolve()));
  });

  test('rota inexistente retorna 404 estruturado', async () => {
    const res = await fetch(`${baseUrl}/nao-existe`);
    assert.equal(res.status, 404);
    const body = (await res.json()) as { statusCode: number };
    assert.equal(body.statusCode, 404);
  });
});
