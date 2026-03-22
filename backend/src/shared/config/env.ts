import 'dotenv/config';

import { z } from 'zod';

function emptyStringToUndefined(value: unknown) {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : undefined;
}

const envSource = {
  ...process.env,
  GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI ?? process.env.GOOGLE_CALLBACK_URL,
};

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  HOST: z.string().min(1).default('0.0.0.0'),
  PORT: z.coerce.number().int().positive().default(3333),
  DATABASE_URL: z.string().min(1).default('postgresql://workcycle:workcycle@localhost:5432/workcycle'),
  FRONTEND_ORIGIN: z.string().url().default('http://localhost:3000'),
  AUTH_TOKEN_SECRET: z.string().min(16).default('workcycle-dev-auth-token-secret'),
  AUTH_REFRESH_TOKEN_SECRET: z.string().min(16).default('workcycle-dev-refresh-token-secret'),
  GOOGLE_CLIENT_ID: z.preprocess(emptyStringToUndefined, z.string().min(1).optional()),
  GOOGLE_CLIENT_SECRET: z.preprocess(emptyStringToUndefined, z.string().min(1).optional()),
  GOOGLE_REDIRECT_URI: z.preprocess(emptyStringToUndefined, z.string().url().optional()),
  FIREBASE_PROJECT_ID: z.preprocess(emptyStringToUndefined, z.string().min(1).optional()),
  FIREBASE_CLIENT_EMAIL: z.preprocess(emptyStringToUndefined, z.string().min(1).optional()),
  FIREBASE_PRIVATE_KEY: z.preprocess(emptyStringToUndefined, z.string().min(1).optional()),
  FIREBASE_SERVICE_ACCOUNT_JSON: z.preprocess(emptyStringToUndefined, z.string().min(1).optional()),
  FIREBASE_SERVICE_ACCOUNT_PATH: z.preprocess(emptyStringToUndefined, z.string().min(1).optional()),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
});

const parsedEnv = envSchema.safeParse(envSource);

if (!parsedEnv.success) {
  throw new Error(`Invalid backend environment variables: ${parsedEnv.error.message}`);
}

export const env = parsedEnv.data;