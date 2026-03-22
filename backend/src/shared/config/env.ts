import 'dotenv/config';

import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  HOST: z.string().min(1).default('0.0.0.0'),
  PORT: z.coerce.number().int().positive().default(3333),
  DATABASE_URL: z.string().min(1).default('postgresql://workcycle:workcycle@localhost:5432/workcycle'),
  FRONTEND_ORIGIN: z.string().url().default('http://localhost:3000'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  throw new Error(`Invalid backend environment variables: ${parsedEnv.error.message}`);
}

export const env = parsedEnv.data;