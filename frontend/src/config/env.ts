import { z } from 'zod';

const envSchema = z.object({
  VITE_API_URL: z.string().url(),
});

const parsedEnv = envSchema.safeParse({
  VITE_API_URL: import.meta.env.VITE_API_URL ?? 'http://localhost:3333',
});

if (!parsedEnv.success) {
  throw new Error('Invalid environment variables for the frontend application.');
}

export const env = parsedEnv.data;