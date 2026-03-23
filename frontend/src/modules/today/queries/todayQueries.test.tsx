import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { todayKeys } from '@/modules/today/queries/todayKeys';
import { useFirePulseMutation } from '@/modules/today/queries/useFirePulseMutation';
import { usePulseRecordsQuery } from '@/modules/today/queries/usePulseRecordsQuery';
import { useTodaySessionQuery } from '@/modules/today/queries/useTodaySessionQuery';
import { useUpdateTodaySessionMutation } from '@/modules/today/queries/useUpdateTodaySessionMutation';
import { todayService } from '@/modules/today/services/todayService';

import type { PulseRecord, TodaySessionDTO } from '@/modules/today/types';

const pulseRecord: PulseRecord = {
  confirmedMinutes: 30,
  firedAt: '2026-03-22T09:30:00.000Z',
  projectId: '550e8400-e29b-41d4-a716-446655440000',
  resolution: 'confirmed',
  respondedAt: '2026-03-22T09:31:00.000Z',
  reviewedAt: '2026-03-22T09:31:00.000Z',
  status: 'confirmed',
};

const todaySession: TodaySessionDTO = {
  activeProjectId: '550e8400-e29b-41d4-a716-446655440000',
  closeDayReview: {
    closedAt: null,
    message: null,
    requiresConfirmation: false,
    unconfirmedMinutes: 0,
  },
  closedAt: null,
  cycleDate: '2026-03-22',
  id: '9bb091f8-f8d5-4bff-9e3d-99524f4078ab',
  operationalBoundary: {
    boundaryStartsAt: '2026-03-22T00:00:00.000Z',
    cycleStartHour: '00:00',
    rolloverWindow: {
      endsAt: '2026-03-23T00:04:59.000Z',
      startsAt: '2026-03-22T23:55:59.000Z',
    },
    timezone: 'UTC',
  },
  pulses: {
    active: null,
    history: [pulseRecord],
  },
  regularization: {
    highlightedPulseIndex: null,
    history: [],
    isOpen: false,
    pendingPulseCount: 0,
  },
  rollover: {
    carryOverInProgressTaskIds: [],
    noticeDescription: null,
    noticeTitle: null,
    previousCycleDate: null,
    strategy: 'manual-start-next',
    triggeredAt: null,
  },
  snapshot: {
    actualHours: 2.5,
    completedTaskIds: ['task-1'],
    incompleteTaskIds: ['task-2'],
    plannedHours: 4,
  },
  startedAt: '2026-03-22T08:00:00.000Z',
  state: 'running',
  taskScope: {
    completedTaskIds: ['task-1'],
    currentTaskIds: ['task-2'],
    linkedCycleSessionId: '9bb091f8-f8d5-4bff-9e3d-99524f4078ab',
    nextCycleTaskIds: [],
    relationMode: 'cycle-session-and-assignment',
  },
  timeBlocks: [
    {
      confirmedMinutes: 30,
      id: 'block-1',
      endedAt: null,
      projectId: '550e8400-e29b-41d4-a716-446655440000',
      startedAt: '2026-03-22T08:00:00.000Z',
    },
  ],
};

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('today queries', () => {
  it('loads the persisted today session and pulse records', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    vi.spyOn(todayService, 'getTodaySession').mockResolvedValue(todaySession);
    vi.spyOn(todayService, 'getPulseRecords').mockResolvedValue(todaySession.pulses.history);

    const sessionHook = renderHook(() => useTodaySessionQuery(), {
      wrapper: createWrapper(queryClient),
    });
    const pulseHook = renderHook(() => usePulseRecordsQuery({ sessionId: todaySession.id ?? undefined }), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(sessionHook.result.current.isSuccess).toBe(true));
    await waitFor(() => expect(pulseHook.result.current.isSuccess).toBe(true));

    expect(sessionHook.result.current.data).toEqual(todaySession);
    expect(pulseHook.result.current.data).toEqual(todaySession.pulses.history);
  });

  it('updates session and pulse caches after session mutation', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    queryClient.setQueryData(todayKeys.session('current'), todaySession);
    vi.spyOn(todayService, 'updateTodaySession').mockResolvedValue({
      ...todaySession,
      state: 'paused_manual',
    });

    const mutationHook = renderHook(() => useUpdateTodaySessionMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await mutationHook.result.current.mutateAsync({
      sessionId: todaySession.id ?? undefined,
      state: 'paused_manual',
    });

    expect(queryClient.getQueryData<TodaySessionDTO>(todayKeys.session('current'))?.state).toBe('paused_manual');
    expect(queryClient.getQueryData<PulseRecord[]>(todayKeys.pulseRecords(todaySession.id ?? 'current'))).toEqual(todaySession.pulses.history);
  });

  it('updates current session cache after firing a pulse', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    vi.spyOn(todayService, 'firePulse').mockResolvedValue({
      ...todaySession,
      pulses: {
        active: {
          expiresAt: '2026-03-22T10:05:00.000Z',
          firedAt: '2026-03-22T10:00:00.000Z',
          projectId: todaySession.activeProjectId,
        },
        history: todaySession.pulses.history,
      },
    });

    const mutationHook = renderHook(() => useFirePulseMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await mutationHook.result.current.mutateAsync({
      firedAt: '2026-03-22T10:00:00.000Z',
      projectId: todaySession.activeProjectId,
      resolution: 'pending',
      sessionId: todaySession.id ?? '9bb091f8-f8d5-4bff-9e3d-99524f4078ab',
      status: 'unconfirmed',
    });

    expect(queryClient.getQueryData<TodaySessionDTO>(todayKeys.session('current'))?.pulses.active?.firedAt).toBe('2026-03-22T10:00:00.000Z');
  });
});