import { env } from './config/env';
import { buildApp } from './app';

export async function startServer() {
  const app = await buildApp();

  const shutdown = async (signal: NodeJS.Signals) => {
    app.log.info({ signal }, 'Shutting down WorkCycle backend');
    await app.close();
    process.exit(0);
  };

  process.on('SIGINT', () => {
    void shutdown('SIGINT');
  });

  process.on('SIGTERM', () => {
    void shutdown('SIGTERM');
  });

  try {
    await app.listen({
      host: env.HOST,
      port: env.PORT,
    });
  } catch (error) {
    app.log.error(error, 'Failed to start WorkCycle backend');
    process.exit(1);
  }

  return app;
}

if (require.main === module) {
  void startServer();
}