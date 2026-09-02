import type { Server } from 'node:http';
import { createApp } from './app.js';
import { loadConfig } from './config.js';
import { createPool, closePool } from './db/index.js';
import { logger } from './logger.js';

function main(): void {
  const config = loadConfig();

  createPool(config.DATABASE_URL);
  logger.info({ port: config.PORT, env: config.NODE_ENV }, 'iniciando servidor');

  const app = createApp();
  const server: Server = app.listen(config.PORT, () => {
    logger.info({ port: config.PORT }, 'servidor no ar');
  });

  // Mantém o processo vivo enquanto o servidor roda
  server.on('listening', () => {
    logger.debug('servidor em listening');
  });

  // Previne saída se houver rejection não tratada
  process.on('unhandledRejection', (reason) => {
    logger.error({ err: reason }, 'unhandled rejection');
  });
  process.on('uncaughtException', (err) => {
    logger.error({ err }, 'uncaught exception');
  });

  // Keep-alive explícito para garantir que o event loop não encerre
  const keepAlive = setInterval(() => {}, 1000);

  let shuttingDown = false;
  function shutdown(signal: string): void {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info({ signal }, 'recebido sinal de encerramento');

    server.close(async () => {
      try {
        await closePool();
        logger.info('encerramento concluído');
        process.exit(0);
      } catch (err) {
        logger.error({ err }, 'erro durante encerramento');
        process.exit(1);
      }
    });

    setTimeout(() => {
      logger.warn('encerramento forçado por timeout');
      process.exit(1);
    }, 10_000).unref();
  }

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main();