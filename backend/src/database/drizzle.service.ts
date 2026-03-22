import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import { databaseConfig, env } from '@/config';
import * as schema from '@/database/schema';

export type AppDatabase = ReturnType<typeof createDatabase>['db'];

const globalDatabase = globalThis as {
  drizzleDb?: AppDatabase;
  drizzleSql?: postgres.Sql;
};

function createDatabase() {
  const client = postgres(databaseConfig.url, {
    max: 1,
    prepare: false,
  });

  const db = drizzle(client, { schema });

  return { client, db };
}

const database = globalDatabase.drizzleDb && globalDatabase.drizzleSql
  ? { db: globalDatabase.drizzleDb, client: globalDatabase.drizzleSql }
  : createDatabase();

if (env.NODE_ENV !== 'production') {
  globalDatabase.drizzleDb = database.db;
  globalDatabase.drizzleSql = database.client;
}

export const drizzleService = {
  db: database.db,
  client: database.client,
  close: async () => {
    await database.client.end({ timeout: 5 });
  },
};