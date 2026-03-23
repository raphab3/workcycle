import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { resetAuthStore, useAuthStore } from '@/modules/auth/store/useAuthStore';
import { weeklyService } from '@/modules/weekly/services/weeklyService';
import { resetWorkspaceStore } from '@/shared/store/useWorkspaceStore';

import { WeeklyBalanceWorkspace } from './index';

import type { WeeklyHistoryDTO, WeeklySnapshotDTO } from '@/modules/weekly/types';

const weeklySnapshotPayload: WeeklySnapshotDTO = {
  generatedAt: '2026-03-23T10:00:00.000Z',
  isFinal: false,
  rows: [
    {
      projectId: 'project-1',
      projectName: 'API Weekly',
      colorHex: '#0F766E',
      plannedWeekHours: 10,
      actualWeekHours: 8.5,
      deltaHours: -1.5,
      status: 'attention',
      cells: [
        { day: 'Seg', date: '2026-03-23', plannedHours: 2, actualHours: 2 },
        { day: 'Ter', date: '2026-03-24', plannedHours: 2, actualHours: 1.5, isProvisional: true },
        { day: 'Qua', date: '2026-03-25', plannedHours: 2, actualHours: 2 },
        { day: 'Qui', date: '2026-03-26', plannedHours: 2, actualHours: 1.5 },
        { day: 'Sex', date: '2026-03-27', plannedHours: 2, actualHours: 1.5 },
        { day: 'Sab', date: '2026-03-28', plannedHours: 0, actualHours: 0 },
        { day: 'Dom', date: '2026-03-29', plannedHours: 0, actualHours: 0 },
      ],
    },
  ],
  source: 'derived-open-week',
  summary: {
    plannedWeekHours: 10,
    actualWeekHours: 8.5,
    attentionProjects: 1,
    criticalProjects: 0,
  },
  timezone: 'America/Sao_Paulo',
  weekEndsAt: '2026-03-28T23:59:59.000Z',
  weekKey: '2026-W13',
  weekStartsAt: '2026-03-23T00:00:00.000Z',
};

const weeklyHistoryPayload: WeeklyHistoryDTO = {
  snapshots: [
    {
      ...weeklySnapshotPayload,
      generatedAt: '2026-03-16T10:00:00.000Z',
      isFinal: true,
      source: 'persisted-weekly-history',
      weekKey: '2026-W12',
    },
  ],
};

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
}

function renderWeeklyBalanceWorkspace() {
  const queryClient = createQueryClient();

  return render(
    <QueryClientProvider client={queryClient}>
      <WeeklyBalanceWorkspace />
    </QueryClientProvider>,
  );
}

function authenticateSession() {
  useAuthStore.setState({
    hasHydrated: true,
    sessionStatus: 'authenticated',
    session: {
      accessToken: 'access-token',
      accessTokenExpiresAt: '2026-03-23T12:00:00.000Z',
      refreshToken: 'refresh-token',
      refreshTokenExpiresAt: '2026-04-23T12:00:00.000Z',
      refreshTokenPolicy: {
        endpoint: '/api/auth/refresh',
        rotation: 'rotate',
        transport: 'body',
      },
      tokenType: 'Bearer',
      user: {
        authProvider: 'google',
        displayName: 'Rafa',
        email: 'rafa@example.com',
        hasGoogleLinked: true,
        hasPassword: true,
        id: 'user-1',
      },
    },
  });
}

describe('WeeklyBalanceWorkspace', () => {
  beforeEach(() => {
    resetWorkspaceStore();
    resetAuthStore();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the local fallback when the user is not authenticated', () => {
    renderWeeklyBalanceWorkspace();

    expect(screen.getByText('Previsto na semana')).toBeInTheDocument();
    expect(screen.getByText('Projeto')).toBeInTheDocument();
    expect(screen.getByText('Dom')).toBeInTheDocument();
    expect(screen.getByText('Previsto')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByRole('table', { name: 'Desvios semanais por projeto' })).toBeInTheDocument();
    expect(screen.getByText('Entre para sincronizar a semana real')).toBeInTheDocument();
  });

  it('renders backend snapshot and persisted history for authenticated users', async () => {
    authenticateSession();
    vi.spyOn(weeklyService, 'getWeeklySnapshot').mockResolvedValue(weeklySnapshotPayload);
    vi.spyOn(weeklyService, 'getWeeklyHistory').mockResolvedValue(weeklyHistoryPayload);

    renderWeeklyBalanceWorkspace();

    await waitFor(() => expect(screen.getAllByText('API Weekly').length).toBeGreaterThan(0));

    expect(screen.getByText('Semana aberta: 2026 · Semana 13')).toBeInTheDocument();
    expect(screen.getByText('Historico recente')).toBeInTheDocument();
    expect(screen.getByText('Semanas fechadas persistidas')).toBeInTheDocument();
    expect(screen.getByText('2026 · Semana 12')).toBeInTheDocument();
    expect(screen.getByText('Dom')).toBeInTheDocument();
    expect(screen.getByText('Fechada')).toBeInTheDocument();
    expect(screen.getAllByText('Atencao').length).toBeGreaterThan(0);
    expect(screen.getByTitle('Dado provisório enquanto a semana atual estiver aberta.')).toBeInTheDocument();
  });

  it('does not render the local fallback when the authenticated backend snapshot fails', async () => {
    authenticateSession();
    vi.spyOn(weeklyService, 'getWeeklySnapshot').mockRejectedValue(new Error('snapshot failed'));
    vi.spyOn(weeklyService, 'getWeeklyHistory').mockResolvedValue({ snapshots: [] });

    renderWeeklyBalanceWorkspace();

    await waitFor(() => expect(screen.getByText('Nao foi possivel carregar a semana atual do backend')).toBeInTheDocument());

    expect(screen.queryByRole('table', { name: 'Desvios semanais por projeto' })).not.toBeInTheDocument();
    expect(screen.queryByText('Previsto na semana')).not.toBeInTheDocument();
  });
});