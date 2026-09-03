import express from 'express';
import { createServiceRoutes, type ServiceDeps } from './routes/service.js';
import { createEventsRoutes, type EventsDeps } from './routes/events.js';
import { cors, errorHandler, notFoundHandler, requestLogger } from './middleware.js';

export interface AppOptions {
  /** Dependências injetáveis para testes. */
  serviceDeps?: ServiceDeps;
  /** Dependências injetáveis para testes da API de eventos. */
  eventsDeps?: EventsDeps;
}

/**
 * Constrói a aplicação Express do The Center.
 * A conexão com o banco deve ser inicializada ANTES de chamar esta função.
 */
export function createApp(options: AppOptions = {}): express.Express {
  const app = express();

  app.disable('x-powered-by');

  app.use(express.json());
  app.use(cors());
  app.use(requestLogger());

  // Endpoints raiz e versão atual da API (mesmo contrato).
  app.use(createServiceRoutes(options.serviceDeps));
  app.use('/api/v1', createServiceRoutes(options.serviceDeps));
  // API de eventos (somente sob /api/v1).
  app.use('/api/v1', createEventsRoutes(options.eventsDeps));

  app.use(notFoundHandler());
  app.use(errorHandler());

  return app;
}
