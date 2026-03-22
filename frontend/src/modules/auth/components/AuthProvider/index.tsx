'use client';

import { useEffect, type ReactNode } from 'react';

import { authService } from '@/modules/auth/services/authService';
import { useAuthStore } from '@/modules/auth/store/useAuthStore';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const hydrateSession = useAuthStore((state) => state.hydrateSession);
  const mergeSession = useAuthStore((state) => state.mergeSession);
  const session = useAuthStore((state) => state.session);
  const signOut = useAuthStore((state) => state.signOut);
  const sessionToken = session?.accessToken;

  useEffect(() => {
    hydrateSession();
  }, [hydrateSession]);

  useEffect(() => {
    if (!sessionToken) {
      return;
    }

    let isActive = true;

    void authService.getAuthSession()
      .then((nextSession) => {
        if (!isActive) {
          return;
        }

        mergeSession(nextSession);
      })
      .catch(() => {
        if (!isActive) {
          return;
        }

        signOut();
      });

    return () => {
      isActive = false;
    };
  }, [mergeSession, sessionToken, signOut]);

  return <>{children}</>;
}