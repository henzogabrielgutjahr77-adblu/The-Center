import { Router } from 'express';
import type { HealthResponse, VersionResponse } from '@the-center/api-types';
import { pingDatabase } from '../db/index.js';

const startedAt = new Date().toISOString();

export interface ServiceDeps {
  /** Função de health check. Padrão: verifica o PostgreSQL. */
  healthCheck?: () => Promise<boolean>;
}

/**
 * Retorna um Router que expõe /health e /version. Usado tanto no nível raiz
 * quanto sob /api/v1 para manter respostas idênticas e consistentes.
 */
export function createServiceRoutes(deps: ServiceDeps = {}): Router {
  const router = Router();

  router.get('/health', async (_req, res) => {
    const healthCheck = deps.healthCheck ?? pingDatabase;
    const dbOk = await healthCheck();
    const timestamp = new Date().toISOString();
    const body: HealthResponse = {
      status: dbOk ? 'ok' : 'degraded',
      timestamp,
      uptime: Math.round(process.uptime()),
      startedAt,
    };
    // Se o banco não estiver acessível, indicamos degradação com status 503.
    res.status(dbOk ? 200 : 503).json(body);
  });

  router.get('/version', (_req, res) => {
    const body: VersionResponse = {
      name: 'the-center-server',
      version: '0.1.0',
    };
    res.json(body);
  });

  return router;
}
