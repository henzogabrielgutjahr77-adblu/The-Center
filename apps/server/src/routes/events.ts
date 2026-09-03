import { Router } from 'express';
import type { EventListResponse } from '@the-center/api-types';
import { listEvents, MAX_EVENTS_LIMIT } from '../db/events.js';

export interface EventsDeps {
  /** Função de listagem de eventos. Padrão: consulta o PostgreSQL. */
  listEvents?: typeof listEvents;
}

/**
 * Retorna um Router que expõe GET /events sob /api/v1.
 * Devolve DigitalEvents canônicos ordenados por timestamp DESC.
 */
export function createEventsRoutes(deps: EventsDeps = {}): Router {
  const router = Router();
  const doList = deps.listEvents ?? listEvents;

  router.get('/events', async (req, res, next) => {
    try {
      const limit = Number(req.query.limit);
      const offset = Number(req.query.offset);
      const { items } = await doList({
        limit: Number.isFinite(limit) ? limit : undefined,
        offset: Number.isFinite(offset) ? offset : undefined,
      });
      const body: EventListResponse = { items };
      res.json(body);
    } catch (err) {
      next(err);
    }
  });

  return router;
}

export { MAX_EVENTS_LIMIT };
