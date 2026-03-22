import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const registerSchema = z.object({
  displayName: z.string().trim().min(2).max(255),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export const firebaseSessionSchema = z.object({
  idToken: z.string().min(1),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type FirebaseSessionInput = z.infer<typeof firebaseSessionSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;