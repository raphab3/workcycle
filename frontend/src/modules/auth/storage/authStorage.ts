import type { StoredAuthSession } from '@/modules/auth/types';

export const AUTH_STORAGE_KEY = 'workcycle-auth-session';

function buildLegacyStoredSession(rawSession: Record<string, unknown>): StoredAuthSession | null {
  const token = typeof rawSession.token === 'string' ? rawSession.token : null;
  const user = typeof rawSession.user === 'object' && rawSession.user !== null ? rawSession.user : null;

  if (!token || !user) {
    return null;
  }

  return {
    accessToken: token,
    accessTokenExpiresAt: null,
    refreshToken: null,
    refreshTokenExpiresAt: null,
    refreshTokenPolicy: {
      endpoint: '/api/auth/refresh',
      rotation: 'rotate',
      transport: 'body',
    },
    tokenType: 'Bearer',
    user: user as StoredAuthSession['user'],
  };
}

function normalizeStoredAuthSession(rawSession: unknown): StoredAuthSession | null {
  if (typeof rawSession !== 'object' || rawSession === null) {
    return null;
  }

  const session = rawSession as Record<string, unknown>;

  if ('token' in session) {
    return buildLegacyStoredSession(session);
  }

  if (
    !('accessToken' in session)
    || !('accessTokenExpiresAt' in session)
    || !('refreshToken' in session)
    || !('refreshTokenExpiresAt' in session)
    ||
    typeof session.tokenType !== 'string'
    || typeof session.user !== 'object'
    || session.user === null
    || typeof session.refreshTokenPolicy !== 'object'
    || session.refreshTokenPolicy === null
  ) {
    return null;
  }

  return session as unknown as StoredAuthSession;
}

export function readStoredAuthSession() {
  if (typeof window === 'undefined') {
    return null;
  }

  const rawSession = window.localStorage.getItem(AUTH_STORAGE_KEY);

  if (!rawSession) {
    return null;
  }

  try {
    const session = normalizeStoredAuthSession(JSON.parse(rawSession));

    if (!session) {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }

    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));

    return session;
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function persistAuthSession(session: StoredAuthSession | null) {
  if (typeof window === 'undefined') {
    return;
  }

  if (!session) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}