import assert from 'node:assert/strict';
import test from 'node:test';

import { AuthWriterService } from '@/modules/auth/services/auth-writer.service';
import { env } from '@/shared/config';

function createService(overrides?: {
  authRepository?: Partial<Record<string, unknown>>;
  firebaseAdminService?: Partial<Record<string, unknown>>;
  getAuthSessionUseCase?: Partial<Record<string, unknown>>;
}) {
  const authRepository = {
    createUser: async () => ({
      authProvider: 'google',
      displayName: 'Raphab',
      email: 'raphab33@gmail.com',
      id: 'user-1',
      passwordHash: null,
    }),
    findGoogleAccountByEmail: async () => null,
    findGoogleAccountByGoogleId: async () => null,
    findUserByEmail: async () => null,
    findUserById: async () => null,
    syncGoogleCalendars: async () => [],
    updateUser: async () => ({
      authProvider: 'hybrid',
      displayName: 'Raphab',
      email: 'raphab33@gmail.com',
      id: 'user-1',
      passwordHash: 'hash',
    }),
    upsertGoogleAccount: async () => ({ id: 'google-account-1', refreshToken: 'refresh-token', userId: 'user-1' }),
    ...overrides?.authRepository,
  };
  const firebaseAdminService = {
    verifyIdToken: async () => ({
      email: 'raphab33@gmail.com',
      firebase: { sign_in_provider: 'google.com' },
      name: 'Raphab',
    }),
    ...overrides?.firebaseAdminService,
  };
  const getAuthSessionUseCase = {
    execute: async () => ({
      accessToken: null,
      accessTokenExpiresAt: null,
      refreshToken: null,
      refreshTokenExpiresAt: null,
      refreshTokenPolicy: {
        endpoint: '/api/auth/refresh',
        rotation: 'rotate',
        transport: 'body',
      },
      tokenType: 'Bearer',
      user: {
        authProvider: 'google',
        displayName: 'Raphab',
        email: 'raphab33@gmail.com',
        hasGoogleLinked: true,
        hasPassword: false,
        id: 'user-1',
      },
    }),
    ...overrides?.getAuthSessionUseCase,
  };

  return new AuthWriterService(
    authRepository as never,
    firebaseAdminService as never,
    { execute: () => 'https://accounts.google.com/o/oauth2/v2/auth' } as never,
    getAuthSessionUseCase as never,
    { execute: async () => ({}) } as never,
    { execute: async () => ({}) } as never,
  );
}

test('handleGoogleCallback persists googleLinkedAt when creating a new Google OAuth user', async () => {
  const originalFetch = globalThis.fetch;
  const originalClientId = env.GOOGLE_CLIENT_ID;
  const originalClientSecret = env.GOOGLE_CLIENT_SECRET;
  const originalRedirectUri = env.GOOGLE_REDIRECT_URI;
  const originalFrontendOrigin = env.FRONTEND_ORIGIN;
  const createUserCalls: Array<Record<string, unknown>> = [];
  const syncGoogleCalendarsCalls: Array<{ accountId: string; calendars: Array<Record<string, unknown>> }> = [];

  env.GOOGLE_CLIENT_ID = 'client-id';
  env.GOOGLE_CLIENT_SECRET = 'client-secret';
  env.GOOGLE_REDIRECT_URI = 'http://localhost:3333/api/auth/google/callback';
  env.FRONTEND_ORIGIN = 'http://localhost:3000';

  globalThis.fetch = (async (input: URL | string | Request) => {
    const url = String(input);

    if (url.includes('/token')) {
      return {
        json: async () => ({ access_token: 'access-token', expires_in: 3600, refresh_token: 'refresh-token' }),
        ok: true,
      } as Response;
    }

    if (url.includes('/userinfo')) {
      return {
        json: async () => ({ email: 'raphab33@gmail.com', id: 'google-1', name: 'Raphab' }),
        ok: true,
      } as Response;
    }

    if (url.includes('/calendarList')) {
      return {
        json: async () => ({
          items: [
            {
              backgroundColor: '#3367D6',
              id: 'primary-calendar-id',
              primary: true,
              summary: 'Primary',
            },
          ],
        }),
        ok: true,
      } as Response;
    }

    throw new Error(`Unexpected fetch call: ${url}`);
  }) as typeof fetch;

  try {
    const service = createService({
      authRepository: {
        createUser: async (input: Record<string, unknown>) => {
          createUserCalls.push(input);

          return {
            authProvider: 'google',
            displayName: String(input.displayName),
            email: String(input.email),
            id: 'user-1',
            passwordHash: null,
          };
        },
        syncGoogleCalendars: async (accountId: string, calendars: Array<Record<string, unknown>>) => {
          syncGoogleCalendarsCalls.push({ accountId, calendars });
          return [];
        },
      },
    });

    const encodedState = Buffer.from(JSON.stringify({ issuedAt: Date.now(), mode: 'login' })).toString('base64url');
    const redirectUrl = await service.handleGoogleCallback('oauth-code', encodedState);

    assert.match(redirectUrl, /\/login\?authSession=/);
    assert.equal(createUserCalls.length, 1);
    assert.equal(createUserCalls[0]?.authProvider, 'google');
    assert.ok(createUserCalls[0]?.googleLinkedAt instanceof Date);
    assert.equal(syncGoogleCalendarsCalls.length, 1);
    assert.equal(syncGoogleCalendarsCalls[0]?.accountId, 'google-account-1');
    assert.equal(syncGoogleCalendarsCalls[0]?.calendars.length, 1);
    assert.equal(syncGoogleCalendarsCalls[0]?.calendars[0]?.googleCalendarId, 'primary-calendar-id');
  } finally {
    env.GOOGLE_CLIENT_ID = originalClientId;
    env.GOOGLE_CLIENT_SECRET = originalClientSecret;
    env.GOOGLE_REDIRECT_URI = originalRedirectUri;
    env.FRONTEND_ORIGIN = originalFrontendOrigin;
    globalThis.fetch = originalFetch;
  }
});

test('loginWithFirebase persists googleLinkedAt when creating a new Google-backed user', async () => {
  const createUserCalls: Array<Record<string, unknown>> = [];
  const service = createService({
    authRepository: {
      createUser: async (input: Record<string, unknown>) => {
        createUserCalls.push(input);

        return {
          authProvider: 'google',
          displayName: String(input.displayName),
          email: String(input.email),
          id: 'user-1',
          passwordHash: null,
        };
      },
    },
  });

  const session = await service.loginWithFirebase('firebase-id-token');

  assert.equal(createUserCalls.length, 1);
  assert.equal(createUserCalls[0]?.authProvider, 'google');
  assert.ok(createUserCalls[0]?.googleLinkedAt instanceof Date);
  assert.equal(session.user.hasGoogleLinked, true);
});