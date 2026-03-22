'use client';

import { create } from 'zustand';

import { persistAuthSession, readStoredAuthSession } from '@/modules/auth/storage/authStorage';

import type { AuthSessionDTO, AuthSessionStatus, AuthUserDTO, StoredAuthSession } from '@/modules/auth/types';

interface AuthStoreState {
  hasHydrated: boolean;
  session: StoredAuthSession | null;
  sessionStatus: AuthSessionStatus;
  hydrateSession: () => void;
  mergeSession: (session: AuthSessionDTO) => void;
  signIn: (session: AuthSessionDTO) => void;
  updateUser: (user: AuthUserDTO) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthStoreState>((set) => ({
  hasHydrated: false,
  session: null,
  sessionStatus: 'loading',
  hydrateSession: () => {
    const session = readStoredAuthSession();

    set({
      hasHydrated: true,
      session,
      sessionStatus: session ? 'authenticated' : 'unauthenticated',
    });
  },
  mergeSession: (session) => set((state) => {
    const nextSession: StoredAuthSession = {
      accessToken: session.accessToken ?? state.session?.accessToken ?? null,
      accessTokenExpiresAt: session.accessTokenExpiresAt ?? state.session?.accessTokenExpiresAt ?? null,
      refreshToken: session.refreshToken ?? state.session?.refreshToken ?? null,
      refreshTokenExpiresAt: session.refreshTokenExpiresAt ?? state.session?.refreshTokenExpiresAt ?? null,
      refreshTokenPolicy: session.refreshTokenPolicy,
      tokenType: session.tokenType,
      user: session.user,
    };

    persistAuthSession(nextSession);

    return {
      hasHydrated: true,
      session: nextSession,
      sessionStatus: 'authenticated',
    };
  }),
  signIn: (session) => {
    persistAuthSession(session);

    set({
      hasHydrated: true,
      session,
      sessionStatus: 'authenticated',
    });
  },
  updateUser: (user) => set((state) => {
    if (!state.session) {
      return state;
    }

    const nextSession = {
      ...state.session,
      user,
    };

    persistAuthSession(nextSession);

    return {
      ...state,
      session: nextSession,
    };
  }),
  signOut: () => {
    persistAuthSession(null);

    set({
      hasHydrated: true,
      session: null,
      sessionStatus: 'unauthenticated',
    });
  },
}));

export function resetAuthStore() {
  persistAuthSession(null);

  useAuthStore.setState({
    hasHydrated: true,
    session: null,
    sessionStatus: 'unauthenticated',
  });
}