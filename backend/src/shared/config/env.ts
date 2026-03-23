import { config as loadDotenv } from 'dotenv';

import { z } from 'zod';

const dotenvResult = loadDotenv();
const dotenvValues = dotenvResult.parsed ?? {};

function emptyStringToUndefined(value: unknown) {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : undefined;
}

function preferConfiguredValue(primaryValue: unknown, fallbackValue: unknown) {
  const normalizedPrimaryValue = emptyStringToUndefined(primaryValue);

  if (normalizedPrimaryValue !== undefined) {
    return normalizedPrimaryValue;
  }

  return emptyStringToUndefined(fallbackValue);
}

const envSource = {
  ...process.env,
  GOOGLE_CLIENT_ID: preferConfiguredValue(process.env.GOOGLE_CLIENT_ID, dotenvValues.GOOGLE_CLIENT_ID),
  GOOGLE_CLIENT_SECRET: preferConfiguredValue(process.env.GOOGLE_CLIENT_SECRET, dotenvValues.GOOGLE_CLIENT_SECRET),
  GOOGLE_REDIRECT_URI: preferConfiguredValue(
    process.env.GOOGLE_REDIRECT_URI ?? process.env.GOOGLE_CALLBACK_URL,
    dotenvValues.GOOGLE_REDIRECT_URI ?? dotenvValues.GOOGLE_CALLBACK_URL,
  ),
  FIREBASE_PROJECT_ID: preferConfiguredValue(process.env.FIREBASE_PROJECT_ID, dotenvValues.FIREBASE_PROJECT_ID),
  FIREBASE_CLIENT_EMAIL: preferConfiguredValue(process.env.FIREBASE_CLIENT_EMAIL, dotenvValues.FIREBASE_CLIENT_EMAIL),
  FIREBASE_PRIVATE_KEY: preferConfiguredValue(process.env.FIREBASE_PRIVATE_KEY, dotenvValues.FIREBASE_PRIVATE_KEY),
  FIREBASE_SERVICE_ACCOUNT_JSON: preferConfiguredValue(process.env.FIREBASE_SERVICE_ACCOUNT_JSON, dotenvValues.FIREBASE_SERVICE_ACCOUNT_JSON),
  FIREBASE_SERVICE_ACCOUNT_PATH: preferConfiguredValue(process.env.FIREBASE_SERVICE_ACCOUNT_PATH, dotenvValues.FIREBASE_SERVICE_ACCOUNT_PATH),
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