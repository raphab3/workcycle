'use client';

import { create } from 'zustand';

import type { AuthSession, AuthSessionStatus } from '@/modules/auth/types';

const AUTH_STORAGE_KEY = 'workcycle-auth-session';

function readStoredSession() {
  if (typeof window === 'undefined') {
    return null;
  }

  const rawSession = window.localStorage.getItem(AUTH_STORAGE_KEY);

  if (!rawSession) {
    return null;
  }

  try {
    return JSON.parse(rawSession) as AuthSession;
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

function persistSession(session: AuthSession | null) {
  if (typeof window === 'undefined') {
    return;
  }

  if (!session) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

interface AuthStoreState {
  hasHydrated: boolean;
  session: AuthSession | null;
  sessionStatus: AuthSessionStatus;
  hydrateSession: () => void;
  signIn: (session: AuthSession) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthStoreState>((set) => ({
  hasHydrated: false,
  session: null,
  sessionStatus: 'loading',
  hydrateSession: () => {
    const session = readStoredSession();

    set({
      hasHydrated: true,
      session,
      sessionStatus: session ? 'authenticated' : 'unauthenticated',
    });
  },
  signIn: (session) => {
    persistSession(session);

    set({
      hasHydrated: true,
      session,
      sessionStatus: 'authenticated',
    });
  },
  signOut: () => {
    persistSession(null);

    set({
      hasHydrated: true,
      session: null,
      sessionStatus: 'unauthenticated',
    });
  },
}));

export function resetAuthStore() {
  persistSession(null);

  useAuthStore.setState({
    hasHydrated: true,
    session: null,
    sessionStatus: 'unauthenticated',
  });
}