import { createHmac, timingSafeEqual } from 'node:crypto';

import { env } from '@/shared/config';

import type { AuthProvider, AuthTokenPayload } from '@/modules/auth/types/auth';

const AUTH_TOKEN_TTL_IN_SECONDS = 60 * 60 * 24 * 7;

function encodeBase64Url(value: string | Buffer) {
  return Buffer.from(value)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function decodeBase64Url(value: string) {
  const normalized = value
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const padding = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));

  return Buffer.from(`${normalized}${padding}`, 'base64').toString('utf-8');
}

function signValue(value: string) {
  return createHmac('sha256', env.AUTH_TOKEN_SECRET).update(value).digest('base64url');
}

export interface IssueAuthTokenInput {
  displayName: string;
  email: string;
  provider: AuthProvider;
  userId: string;
}

export function issueAuthToken(input: IssueAuthTokenInput) {
  const payload: AuthTokenPayload = {
    displayName: input.displayName,
    email: input.email,
    exp: Math.floor(Date.now() / 1_000) + AUTH_TOKEN_TTL_IN_SECONDS,
    provider: input.provider,
    sub: input.userId,
  };

  const encodedPayload = encodeBase64Url(JSON.stringify(payload));
  const signature = signValue(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export function verifyAuthToken(token: string) {
  const [encodedPayload, signature] = token.split('.');

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = signValue(encodedPayload);

  if (expectedSignature.length !== signature.length) {
    return null;
  }

  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    return null;
  }

  const payload = JSON.parse(decodeBase64Url(encodedPayload)) as AuthTokenPayload;

  if (payload.exp <= Math.floor(Date.now() / 1_000)) {
    return null;
  }

  return payload;
}