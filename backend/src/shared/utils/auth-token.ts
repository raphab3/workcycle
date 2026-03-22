import { createHmac, timingSafeEqual } from 'node:crypto';

import { env } from '@/shared/config';

import type { AuthProvider, AuthTokenPayload, AuthTokenType } from '@/modules/auth/types/auth';

const ACCESS_TOKEN_TTL_IN_SECONDS = 60 * 15;
const REFRESH_TOKEN_TTL_IN_SECONDS = 60 * 60 * 24 * 7;

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

function signValue(value: string, secret: string) {
  return createHmac('sha256', secret).update(value).digest('base64url');
}

export interface IssueAuthTokenInput {
  displayName: string;
  email: string;
  provider: AuthProvider;
  userId: string;
}

function buildToken(payload: AuthTokenPayload, secret: string) {
  const encodedPayload = encodeBase64Url(JSON.stringify(payload));
  const signature = signValue(encodedPayload, secret);

  return `${encodedPayload}.${signature}`;
}

function buildAuthTokenPayload(input: IssueAuthTokenInput, tokenType: AuthTokenType, ttlInSeconds: number): AuthTokenPayload {
  const payload: AuthTokenPayload = {
    displayName: input.displayName,
    email: input.email,
    exp: Math.floor(Date.now() / 1_000) + ttlInSeconds,
    provider: input.provider,
    sub: input.userId,
    tokenType,
  };

  return payload;
}

function verifyToken(token: string, tokenType: AuthTokenType, secret: string) {
  const [encodedPayload, signature] = token.split('.');

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = signValue(encodedPayload, secret);

  if (expectedSignature.length !== signature.length) {
    return null;
  }

  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    return null;
  }

  const payload = JSON.parse(decodeBase64Url(encodedPayload)) as AuthTokenPayload;

  if (payload.tokenType !== tokenType || payload.exp <= Math.floor(Date.now() / 1_000)) {
    return null;
  }

  return payload;
}

export function issueAccessToken(input: IssueAuthTokenInput) {
  const payload = buildAuthTokenPayload(input, 'access', ACCESS_TOKEN_TTL_IN_SECONDS);

  return {
    expiresAt: new Date(payload.exp * 1_000).toISOString(),
    token: buildToken(payload, env.AUTH_TOKEN_SECRET),
  };
}

export function issueRefreshToken(input: IssueAuthTokenInput) {
  const payload = buildAuthTokenPayload(input, 'refresh', REFRESH_TOKEN_TTL_IN_SECONDS);

  return {
    expiresAt: new Date(payload.exp * 1_000).toISOString(),
    token: buildToken(payload, env.AUTH_REFRESH_TOKEN_SECRET),
  };
}

export function verifyAccessToken(token: string) {
  return verifyToken(token, 'access', env.AUTH_TOKEN_SECRET);
}

export function verifyRefreshToken(token: string) {
  return verifyToken(token, 'refresh', env.AUTH_REFRESH_TOKEN_SECRET);
}