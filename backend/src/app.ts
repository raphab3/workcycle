import cors from '@fastify/cors';
import Fastify from 'fastify';

import { appConfig } from '@/config';
import { drizzlePlugin } from '@/plugins/drizzle';
import { healthRoutes } from '@/routes/health';

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: appConfig.logLevel,
    },
  });

  await app.register(cors, {
    credentials: true,
    origin: appConfig.frontendOrigin,
  });

  await app.register(drizzlePlugin);
  await app.register(healthRoutes, { prefix: '/api' });

  return app;
}