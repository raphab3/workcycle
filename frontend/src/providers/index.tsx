'use client';

import { useEffect, type ReactNode } from 'react';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { queryClient } from '@/lib/queryClient';
import { AuthProvider } from '@/modules/auth';
import { useUserSettingsQuery } from '@/modules/auth/queries/useUserSettingsQuery';
import { useAuthStore } from '@/modules/auth/store/useAuthStore';
import { useWorkspaceStore } from '@/shared/store/useWorkspaceStore';
import { ThemeProvider } from '@/shared/theme';

interface AppProvidersProps {
  children: ReactNode;
}

function SettingsHydrator() {
  const session = useAuthStore((state) => state.session);
  const setOperationalSettings = useWorkspaceStore((state) => state.setOperationalSettings);
  const settingsQuery = useUserSettingsQuery({ enabled: Boolean(session) });

  useEffect(() => {
    if (!settingsQuery.data) {
      return;
    }

    setOperationalSettings({
      cycleStartHour: settingsQuery.data.cycleStartHour,
      dailyReviewTime: settingsQuery.data.dailyReviewTime,
      notificationsEnabled: settingsQuery.data.notificationsEnabled,
      timezone: settingsQuery.data.timezone,
    });
  }, [setOperationalSettings, settingsQuery.data]);

  return null;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SettingsHydrator />
          {children}
        </AuthProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ThemeProvider>
  );
}