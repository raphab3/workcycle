'use client';

import { useEffect, type ReactNode } from 'react';

import { authService } from '@/modules/auth/services/authService';
import { useAuthStore } from '@/modules/auth/store/useAuthStore';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const hydrateSession = useAuthStore((state) => state.hydrateSession);
  const session = useAuthStore((state) => state.session);
  const signOut = useAuthStore((state) => state.signOut);
  const updateUser = useAuthStore((state) => state.updateUser);

  useEffect(() => {
    hydrateSession();
  }, [hydrateSession]);

  useEffect(() => {
    if (!session) {
      return;
    }

    let isActive = true;

    void authService.getAuthSession()
      .then((user) => {
        if (!isActive) {
          return;
        }

        updateUser(user);
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
  }, [session, signOut, updateUser]);

  return <>{children}</>;
}