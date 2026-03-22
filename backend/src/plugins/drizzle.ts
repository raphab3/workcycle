import fp from 'fastify-plugin';

import type { FastifyPluginAsync } from 'fastify';

import { drizzleService } from '@/database/drizzle.service';

const databasePlugin: FastifyPluginAsync = async (app) => {
  app.decorate('db', drizzleService.db);
  app.decorate('sql', drizzleService.client);

  app.addHook('onClose', async () => {
    await drizzleService.close();
  });
};

export const drizzlePlugin = fp(databasePlugin, {
  name: 'drizzle',
});