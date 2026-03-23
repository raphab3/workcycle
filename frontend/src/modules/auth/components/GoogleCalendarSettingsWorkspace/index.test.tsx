import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { resetAuthStore, useAuthStore } from '@/modules/auth/store/useAuthStore';
import { ThemeProvider } from '@/shared/theme';

import { GoogleCalendarSettingsWorkspace } from './index';

const {
  getGoogleLinkUrlMock,
  googleAccountsQueryState,
  handleAssignMock,
  mutateCalendarAsyncMock,
  searchParamsMock,
  settingsQueryState,
} = vi.hoisted(() => ({
  getGoogleLinkUrlMock: vi.fn(),
  googleAccountsQueryState: {
    data: [] as Array<{
      calendars: Array<{
        accountId: string;
        colorHex: string;
        id: string;
        isIncluded: boolean;
        isPrimary: boolean;
        name: string;
        syncedAt: string | null;
      }>;
      displayName: string;
      email: string;
      id: string;
      isActive: boolean;
      tokenExpiresAt: string;
      updatedAt: string;
    }>,
    isError: false,
    isFetching: false,
  },
  handleAssignMock: vi.fn(),
  mutateCalendarAsyncMock: vi.fn(),
  searchParamsMock: new URLSearchParams(),
  settingsQueryState: {
    data: {
      cycleStartHour: '08:00',
      dailyReviewTime: '18:30',
      googleConnection: {
        connectedAccountCount: 1,
        hasGoogleLinked: true,
        linkedAt: '2026-03-22T10:00:00.000Z',
      },
      notificationsEnabled: true,
      timezone: 'America/Sao_Paulo',
    },
    error: null as unknown,
    isPending: false,
    isRefetching: false,
  },
}));

vi.mock('next/navigation', () => ({
  useSearchParams: () => searchParamsMock,
}));

vi.mock('@/modules/auth/queries/useAuthStatusQuery', () => ({
  useAuthStatusQuery: () => ({
    data: {
      emailPasswordEnabled: true,
      firebaseConfigured: false,
      oauthConfigured: true,
      provider: 'google',
      status: 'ready',
    },
  }),
}));

vi.mock('@/modules/auth/queries/useGoogleAccountsQuery', () => ({
  useGoogleAccountsQuery: () => googleAccountsQueryState,
}));

vi.mock('@/modules/settings', async () => {
  const actual = await vi.importActual<typeof import('@/modules/settings')>('@/modules/settings');

  return {
    ...actual,
    useUserSettingsQuery: () => settingsQueryState,
  };
});

vi.mock('@/modules/auth/queries/useUpdateGoogleCalendarMutation', () => ({
  useUpdateGoogleCalendarMutation: () => ({
    isPending: false,
    mutateAsync: mutateCalendarAsyncMock,
  }),
}));

vi.mock('@/modules/auth/services/authService', () => ({
  authService: {
    getGoogleLinkUrl: getGoogleLinkUrlMock,
  },
}));

function renderWorkspace() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <GoogleCalendarSettingsWorkspace />
      </ThemeProvider>
    </QueryClientProvider>,
  );
}

describe('GoogleCalendarSettingsWorkspace', () => {
  beforeEach(() => {
    resetAuthStore();
    googleAccountsQueryState.data = [];
    googleAccountsQueryState.isError = false;
    googleAccountsQueryState.isFetching = false;
    settingsQueryState.data = {
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
    settingsQueryState.error = null;
    settingsQueryState.isPending = false;
    settingsQueryState.isRefetching = false;
    getGoogleLinkUrlMock.mockReset();
    mutateCalendarAsyncMock.mockReset();
    handleAssignMock.mockReset();
    useAuthStore.getState().signIn({
      accessToken: 'auth-token',
      accessTokenExpiresAt: '2026-03-22T12:00:00.000Z',
      refreshToken: 'refresh-token',
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
    });
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        assign: handleAssignMock,
      },
    });
  });

  it('renders multiple accounts and their calendars', () => {
    googleAccountsQueryState.data = [
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
          tokenExpiresAt: '2099-03-22T12:00:00.000Z',
          updatedAt: '2026-03-22T10:00:00.000Z',
        },
        {
          calendars: [],
          displayName: 'Rafa Personal',
          email: 'rafa@home.dev',
          id: 'account-2',
          isActive: false,
          tokenExpiresAt: '2026-03-21T12:00:00.000Z',
          updatedAt: '2026-03-22T08:00:00.000Z',
        },
      ];
    googleAccountsQueryState.isError = false;
    googleAccountsQueryState.isFetching = false;

    renderWorkspace();

    expect(screen.getByText('Rafa Work')).toBeInTheDocument();
    expect(screen.getByText('rafa@work.dev')).toBeInTheDocument();
    expect(screen.getAllByText('Primary')).toHaveLength(2);
    expect(screen.getByText('Rafa Personal')).toBeInTheDocument();
    expect(screen.getByText('Esta conta precisa de atencao')).toBeInTheDocument();
    expect(screen.getByText('Esta conta ainda nao retornou calendarios conectados')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Conectar outra conta Google Calendar' })).toBeInTheDocument();
  });

  it('toggles a calendar inclusion from the integrations card', async () => {
    const user = userEvent.setup();
    googleAccountsQueryState.data = [
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
          tokenExpiresAt: '2099-03-22T12:00:00.000Z',
          updatedAt: '2026-03-22T10:00:00.000Z',
        },
      ];
    googleAccountsQueryState.isError = false;
    googleAccountsQueryState.isFetching = false;

    renderWorkspace();

    await user.click(screen.getByRole('button', { name: 'Excluir da agenda' }));

    expect(mutateCalendarAsyncMock).toHaveBeenCalledWith({ calendarId: 'calendar-1', isIncluded: false });
  });

  it('starts the Google account linking flow with the dedicated multi-account CTA', async () => {
    const user = userEvent.setup();

    googleAccountsQueryState.data = [
        {
          calendars: [],
          displayName: 'Rafa Work',
          email: 'rafa@work.dev',
          id: 'account-1',
          isActive: true,
          tokenExpiresAt: '2099-03-22T12:00:00.000Z',
          updatedAt: '2026-03-22T10:00:00.000Z',
        },
      ];
    googleAccountsQueryState.isError = false;
    googleAccountsQueryState.isFetching = false;
    getGoogleLinkUrlMock.mockResolvedValue({ url: 'https://accounts.google.test/link' });

    renderWorkspace();

    await user.click(screen.getByRole('button', { name: 'Conectar outra conta Google Calendar' }));

    expect(getGoogleLinkUrlMock).toHaveBeenCalledTimes(1);
    expect(handleAssignMock).toHaveBeenCalledWith('https://accounts.google.test/link');
  });

  it('shows a global integrations warning when the accounts query fails', () => {
    googleAccountsQueryState.data = [];
    googleAccountsQueryState.isError = true;
    googleAccountsQueryState.isFetching = false;

    renderWorkspace();

    expect(screen.getByText('Nao foi possivel carregar as contas Google agora')).toBeInTheDocument();
  });

  it('shows a settings synchronization warning when the persisted settings query fails', () => {
    settingsQueryState.data = null;
    settingsQueryState.error = new Error('settings unavailable');
    settingsQueryState.isPending = false;
    settingsQueryState.isRefetching = false;

    renderWorkspace();

    expect(screen.getByText('Falha ao sincronizar os dados da conta')).toBeInTheDocument();
  });
});