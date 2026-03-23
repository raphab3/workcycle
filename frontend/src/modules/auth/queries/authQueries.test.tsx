import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { authKeys } from '@/modules/auth/queries/authKeys';
import { useGoogleAccountsQuery } from '@/modules/auth/queries/useGoogleAccountsQuery';
import { useUpdateGoogleCalendarMutation } from '@/modules/auth/queries/useUpdateGoogleCalendarMutation';
import { authService } from '@/modules/auth/services/authService';
import { settingsKeys, settingsService, useUpdateUserSettingsMutation, useUserSettingsQuery } from '@/modules/settings';

import type { GoogleAccountDTO } from '@/modules/auth/types';
import type { UserSettingsDTO } from '@/modules/settings';

const accountsPayload: GoogleAccountDTO[] = [
  {
    calendars: [
      {
        accountId: 'account-1',
        colorHex: '#3367D6',
        id: 'calendar-1',
        isIncluded: true,
        isPrimary: true,
        name: 'Primary',
        syncedAt: '2026-03-22T09:00:00.000Z',
      },
    ],
    displayName: 'Rafa Work',
    email: 'rafa@work.dev',
    id: 'account-1',
    isActive: true,
    tokenExpiresAt: '2026-03-22T12:00:00.000Z',
    updatedAt: '2026-03-22T10:00:00.000Z',
  },
];

const settingsPayload: UserSettingsDTO = {
  cycleStartHour: '08:00',
  dailyReviewTime: '18:30',
  googleConnection: {
    connectedAccountCount: 1,
    hasGoogleLinked: true,
    linkedAt: '2026-03-22T10:00:00.000Z',
  },
  notificationsEnabled: true,
  timezone: 'America/Sao_Paulo',
};

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('auth and settings queries', () => {
  it('loads persisted user settings from the backend settings contract', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    vi.spyOn(settingsService, 'getUserSettings').mockResolvedValue(settingsPayload);

    const { result } = renderHook(() => useUserSettingsQuery(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(settingsPayload);
  });

  it('loads connected google accounts with calendars', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    vi.spyOn(authService, 'getGoogleAccounts').mockResolvedValue(accountsPayload);

    const { result } = renderHook(() => useGoogleAccountsQuery(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(accountsPayload);
  });

  it('updates calendar inclusion in cache after the toggle mutation', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
    queryClient.setQueryData(authKeys.accounts(), accountsPayload);

    vi.spyOn(authService, 'updateGoogleCalendar').mockResolvedValue({
      accountId: 'account-1',
      colorHex: '#3367D6',
      id: 'calendar-1',
      isIncluded: false,
      isPrimary: true,
      name: 'Primary',
      syncedAt: '2026-03-22T09:00:00.000Z',
    });

    const { result } = renderHook(() => useUpdateGoogleCalendarMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await result.current.mutateAsync({ calendarId: 'calendar-1', isIncluded: false });

    expect(queryClient.getQueryData<GoogleAccountDTO[]>(authKeys.accounts())?.[0]?.calendars[0]?.isIncluded).toBe(false);
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: authKeys.accounts() });
  });

  it('updates persisted settings cache after the settings mutation', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
    queryClient.setQueryData(settingsKeys.user(), settingsPayload);

    vi.spyOn(settingsService, 'updateUserSettings').mockResolvedValue({
      ...settingsPayload,
      notificationsEnabled: false,
      timezone: 'UTC',
    });

    const { result } = renderHook(() => useUpdateUserSettingsMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await result.current.mutateAsync({ notificationsEnabled: false, timezone: 'UTC' });

    expect(queryClient.getQueryData<UserSettingsDTO>(settingsKeys.user())).toEqual({
      ...settingsPayload,
      notificationsEnabled: false,
      timezone: 'UTC',
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: settingsKeys.user() });
  });
});