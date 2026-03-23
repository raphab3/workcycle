import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useWeeklyHistoryQuery } from '@/modules/weekly/queries/useWeeklyHistoryQuery';
import { useWeeklySnapshotQuery } from '@/modules/weekly/queries/useWeeklySnapshotQuery';
import { weeklyService } from '@/modules/weekly/services/weeklyService';

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

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('weekly queries', () => {
  it('loads the current weekly snapshot from the backend contract', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    const getWeeklySnapshotSpy = vi.spyOn(weeklyService, 'getWeeklySnapshot').mockResolvedValue(weeklySnapshotPayload);

    const { result } = renderHook(() => useWeeklySnapshotQuery(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(weeklySnapshotPayload);
    expect(getWeeklySnapshotSpy).toHaveBeenCalledWith(undefined);
  });

  it('loads the weekly history window with the configured limit', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    const getWeeklyHistorySpy = vi.spyOn(weeklyService, 'getWeeklyHistory').mockResolvedValue(weeklyHistoryPayload);

    const { result } = renderHook(() => useWeeklyHistoryQuery({ limit: 4 }), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(weeklyHistoryPayload);
    expect(getWeeklyHistorySpy).toHaveBeenCalledWith({
      fromWeekKey: undefined,
      limit: 4,
      toWeekKey: undefined,
    });
  });
});