import { env } from '@/config/env';

export const appConfig = {
  frontendOrigin: env.FRONTEND_ORIGIN,
  host: env.HOST,
  logLevel: env.LOG_LEVEL,
  nodeEnv: env.NODE_ENV,
  port: env.PORT,
} as const;