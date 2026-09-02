import type { ErrorRequestHandler, RequestHandler } from 'express';
import type { ApiError } from '@the-center/api-types';
import { logger } from './logger.js';

/**
 * Middleware de tratamento consistente de erros.
 * Converte qualquer erro lançado em uma resposta ApiError estruturada.
 */

export class HttpError extends Error {
  readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = 'HttpError';
    this.statusCode = statusCode;
  }
}

export function notFoundHandler(): RequestHandler {
  return (_req, res) => {
    const body: ApiError = {
      error: 'NotFound',
      message: 'Recurso não encontrado',
      statusCode: 404,
    };
    res.status(404).json(body);
  };
}

export function errorHandler(): ErrorRequestHandler {
  return (err, _req, res, _next) => {
    const statusCode = err instanceof HttpError ? err.statusCode : 500;
    const message = err instanceof HttpError ? err.message : 'Erro interno do servidor';

    // Nunca registrar conteúdo sensível; apenas a mensagem de erro e o stack
    // em ambiente de desenvolvimento.
    if (statusCode >= 500) {
      logger.error({ err }, 'erro não tratado na rota');
    }

    const body: ApiError = { error: 'Error', message, statusCode };
    res.status(statusCode).json(body);
  };
}

/** Logger de acesso estruturado, sem corpo de requisição. */
export function requestLogger(): RequestHandler {
  return (req, res, next) => {
    res.on('finish', () => {
      logger.info(
        {
          method: req.method,
          path: req.originalUrl,
          status: res.statusCode,
        },
        'request',
      );
    });
    next();
  };
}
