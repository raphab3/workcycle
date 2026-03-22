import { describe, expect, it } from 'vitest';

import { AUTH_STORAGE_KEY, readStoredAuthSession } from '@/modules/auth/storage/authStorage';

describe('authStorage', () => {
  it('migrates legacy token-based sessions to the canonical auth contract', () => {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
      token: 'legacy-token',
      user: {
        authProvider: 'email',
        displayName: 'Rafa',
        email: 'rafa@example.com',
        hasGoogleLinked: false,
        hasPassword: true,
        id: 'user-1',
      },
    }));

    expect(readStoredAuthSession()).toEqual({
      accessToken: 'legacy-token',
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
        authProvider: 'email',
        displayName: 'Rafa',
        email: 'rafa@example.com',
        hasGoogleLinked: false,
        hasPassword: true,
        id: 'user-1',
      },
    });
  });

  it('drops invalid persisted sessions', () => {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ foo: 'bar' }));

    expect(readStoredAuthSession()).toBeNull();
    expect(window.localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
  });
});