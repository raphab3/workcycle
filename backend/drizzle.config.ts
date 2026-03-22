import { defineConfig } from 'drizzle-kit';

const databaseUrl = process.env.DATABASE_URL ?? 'postgresql://workcycle:workcycle@localhost:5432/workcycle';

export default defineConfig({
  dbCredentials: {
    url: databaseUrl,
  },
  dialect: 'postgresql',
  out: './src/database/migrations',
  schema: './src/database/schema/index.ts',
  strict: true,
  verbose: true,
});