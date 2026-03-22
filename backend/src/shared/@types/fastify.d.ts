import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type postgres from 'postgres';

import type * as schema from '@/shared/database/schema';

declare module 'fastify' {
  interface FastifyInstance {
    db: PostgresJsDatabase<typeof schema>;
    sql: postgres.Sql;
  }
}