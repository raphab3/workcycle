import { env } from '@/shared/config/env';

export const databaseConfig = {
  url: env.DATABASE_URL,
} as const;