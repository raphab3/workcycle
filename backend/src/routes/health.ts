import { sql } from 'drizzle-orm';

import type { FastifyPluginAsync } from 'fastify';

export const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get('/health', async (_request, reply) => {
    await app.db.execute(sql`select 1`);

    return reply.code(200).send({
      status: 'ok',
      timestamp: new Date().toISOString(),
    });
  });
};