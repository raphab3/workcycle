import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { resetAuthStore, useAuthStore } from '@/modules/auth/store/useAuthStore';
import { resetNotificationsStore, useNotificationsStore } from '@/modules/notifications';
import { ThemeProvider } from '@/shared/theme';

import { NotificationsSettingsWorkspace } from './index';

const mutateSettingsAsyncMock = vi.fn();
let settingsQueryState = {
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
};
let updateUserSettingsMutationState = {
  error: null as unknown,
  isPending: false,
  isSuccess: false,
  mutateAsync: mutateSettingsAsyncMock,
};
const capabilityState = {
  permission: 'default' as const,
  productEnabled: true,
  supportsBrowserNotification: true,
  visibilityState: 'visible' as DocumentVisibilityState,
  windowFocused: true,
};

vi.mock('@/modules/settings/queries/useUserSettingsQuery', () => ({
  useUserSettingsQuery: () => settingsQueryState,
}));

vi.mock('@/modules/settings/queries/useUpdateUserSettingsMutation', () => ({
  useUpdateUserSettingsMutation: () => updateUserSettingsMutationState,
}));

vi.mock('@/modules/notifications', async () => {
  const actual = await vi.importActual<typeof import('@/modules/notifications')>('@/modules/notifications');

  return {
    ...actual,
    useNotificationCapability: () => capabilityState,
  };
});

function renderWorkspace() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <NotificationsSettingsWorkspace />
      </ThemeProvider>
    </QueryClientProvider>,
  );
}

describe('NotificationsSettingsWorkspace', () => {
  beforeEach(() => {
    resetAuthStore();
    resetNotificationsStore();
    mutateSettingsAsyncMock.mockReset();
    settingsQueryState = {
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
      error: null,
      isPending: false,
    };
    updateUserSettingsMutationState = {
      error: null,
      isPending: false,
      isSuccess: false,
      mutateAsync: mutateSettingsAsyncMock,
    };
    capabilityState.permission = 'default';
    capabilityState.productEnabled = true;
    capabilityState.supportsBrowserNotification = true;
    capabilityState.visibilityState = 'visible';
    capabilityState.windowFocused = true;
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
  });

  it('renders a separate notifications area with current capability and history', () => {
    useNotificationsStore.setState({
      degradedReason: 'browser-permission-default',
      reminderHistory: [
        {
          contextLabel: 'Pulso de atividade',
          eventId: 'event-1',
          occurredAt: '2026-03-22T10:00:00.000Z',
          status: 'shown',
          type: 'activity-pulse-due',
        },
      ],
    });

    renderWorkspace();

    expect(screen.getByText('Notificacoes operacionais')).toBeInTheDocument();
    expect(screen.getByDisplayValue('America/Sao_Paulo')).toBeInTheDocument();
    expect(screen.getByDisplayValue('18:30')).toBeInTheDocument();
    expect(screen.getByText('Permissao pendente')).toBeInTheDocument();
    expect(screen.getByText('O ambiente esta operando em fallback')).toBeInTheDocument();
    expect(screen.getByText('Pulso de atividade')).toBeInTheDocument();
  });

  it('submits the notifications preferences form', async () => {
    const user = userEvent.setup();

    renderWorkspace();

    await user.clear(screen.getByLabelText('Timezone operacional'));
    await user.type(screen.getByLabelText('Timezone operacional'), 'UTC');
    await user.clear(screen.getByLabelText('Horario da revisao diaria'));
    await user.type(screen.getByLabelText('Horario da revisao diaria'), '19:15');
    await user.click(screen.getByRole('button', { name: 'Salvar preferencias' }));

    expect(mutateSettingsAsyncMock).toHaveBeenCalledWith({
      cycleStartHour: '08:00',
      dailyReviewTime: '19:15',
      notificationsEnabled: true,
      timezone: 'UTC',
    });
  });

  it('executes a preview using the current delivery engine state', async () => {
    const user = userEvent.setup();

    renderWorkspace();

    await user.click(screen.getByRole('button', { name: 'Testar notificacao' }));

    expect(useNotificationsStore.getState().lastDeliveryDecision?.channel).toBe('in-app');
    expect(screen.getByText('O motor entregaria um aviso in-app neste contexto.')).toBeInTheDocument();
    expect(screen.getByText('Preview de notificacoes operacionais')).toBeInTheDocument();
  });

  it('shows an integrations warning when preferences fail to load', () => {
    settingsQueryState = {
      data: null,
      error: new Error('settings unavailable'),
      isPending: false,
    };

    renderWorkspace();

    expect(screen.getByText('Falha ao sincronizar preferencias')).toBeInTheDocument();
  });
});