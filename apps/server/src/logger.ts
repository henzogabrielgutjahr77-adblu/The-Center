import { pino } from 'pino';

/**
 * Logger estruturado (JSON). Nunca registra credenciais, tokens, senhas ou
 * conteúdo de eventos sensíveis. Ver docs/SECURITY.md.
 */

export const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  base: {
    service: 'the-center-server',
  },
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      '*.password',
      '*.secret',
      '*.token',
      '*.apiKey',
      '*.api_key',
    ],
    censor: '[REDACTED]',
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});
