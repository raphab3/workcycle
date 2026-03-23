import { beforeEach, describe, expect, it } from 'vitest';

import { AUTH_STORAGE_KEY } from '@/modules/auth/storage/authStorage';

import { resetAuthStore, useAuthStore } from './useAuthStore';

describe('useAuthStore', () => {
  beforeEach(() => {
    window.localStorage.clear();
    resetAuthStore();
  });

  it('hydrates the authenticated session from persisted storage after reload', () => {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
      accessToken: 'persisted-access-token',
      accessTokenExpiresAt: '2026-03-22T12:00:00.000Z',
      refreshToken: 'persisted-refresh-token',
      refreshTokenExpiresAt: '2026-03-29T12:00:00.000Z',
      refreshTokenPolicy: {
        endpoint: '/api/auth/refresh',
        rotation: 'rotate',
        transport: 'body',
      },
      tokenType: 'Bearer',
      user: {
        authProvider: 'hybrid',
        displayName: 'Rafa',
        email: 'rafa@example.com',
        hasGoogleLinked: true,
        hasPassword: true,
        id: 'user-1',
      },
    }));

    useAuthStore.getState().hydrateSession();

    expect(useAuthStore.getState().sessionStatus).toBe('authenticated');
    expect(useAuthStore.getState().session).toMatchObject({
      accessToken: 'persisted-access-token',
      refreshToken: 'persisted-refresh-token',
    });
  });

  it('hydrates as unauthenticated when there is no persisted session', () => {
    useAuthStore.getState().hydrateSession();

    expect(useAuthStore.getState().hasHydrated).toBe(true);
    expect(useAuthStore.getState().session).toBeNull();
    expect(useAuthStore.getState().sessionStatus).toBe('unauthenticated');
  });
});