import { env } from '@/config/env';

export const databaseConfig = {
  url: env.DATABASE_URL,
} as const;