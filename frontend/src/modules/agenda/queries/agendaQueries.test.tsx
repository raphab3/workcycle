import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { agendaKeys } from '@/modules/agenda/queries/agendaKeys';
import { useAgendaEventsQuery } from '@/modules/agenda/queries/useAgendaEventsQuery';
import { useCreateAgendaEventMutation } from '@/modules/agenda/queries/useCreateAgendaEventMutation';
import { useDeleteAgendaEventMutation } from '@/modules/agenda/queries/useDeleteAgendaEventMutation';
import { useRefreshAgendaMutation } from '@/modules/agenda/queries/useRefreshAgendaMutation';
import { useRespondAgendaEventMutation } from '@/modules/agenda/queries/useRespondAgendaEventMutation';
import { useUpdateAgendaEventMutation } from '@/modules/agenda/queries/useUpdateAgendaEventMutation';
import { agendaService } from '@/modules/agenda/services/agendaService';

import type { AgendaEvent, AgendaEventsResult } from '@/modules/agenda/types';

const interval = {
  from: '2026-03-22T03:00:00.000Z',
  to: '2026-03-23T02:59:59.999Z',
};

const agendaEventPayload: AgendaEvent = {
  accountDisplayName: 'Rafa Work',
  accountEmail: 'rafa@work.dev',
  accountId: 'account-1',
  attendees: [],
  calendarColorHex: '#3367D6',
  calendarId: 'calendar-1',
  calendarName: 'Primary',
  description: 'Daily do produto',
  endAt: '2026-03-22T10:00:00.000Z',
  id: 'calendar-1:event-1',
  isAllDay: false,
  location: 'Meet',
  meetLink: null,
  projectId: null,
  recurrenceRule: null,
  recurringEventId: null,
  responseStatus: 'accepted',
  startAt: '2026-03-22T09:00:00.000Z',
  syncedAt: '2026-03-22T08:50:00.000Z',
  title: 'Daily operacional',
  updatedAt: '2026-03-22T08:50:00.000Z',
};

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('agenda queries', () => {
  it('loads the backend agenda list through useAgendaEventsQuery', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    vi.spyOn(agendaService, 'getEvents').mockResolvedValue({ degradedSources: [], events: [agendaEventPayload] });

    const { result } = renderHook(() => useAgendaEventsQuery({ ...interval }), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.events).toEqual([agendaEventPayload]);
  });

  it('updates cache after refresh, create, update, response and delete mutations', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
    queryClient.setQueryData<AgendaEventsResult>(agendaKeys.list(interval), { degradedSources: [], events: [agendaEventPayload] });

    vi.spyOn(agendaService, 'refreshEvents').mockResolvedValue({
      degradedSources: [{ accountId: 'account-1', reason: 'partial failure' }],
      events: [agendaEventPayload],
    });
    vi.spyOn(agendaService, 'createEvent').mockResolvedValue({
      ...agendaEventPayload,
      endAt: '2026-03-22T12:00:00.000Z',
      id: 'calendar-1:event-2',
      startAt: '2026-03-22T11:00:00.000Z',
      title: 'Planejamento semanal',
    });
    vi.spyOn(agendaService, 'updateEvent').mockResolvedValue({
      ...agendaEventPayload,
      title: 'Daily revisada',
    });
    vi.spyOn(agendaService, 'respondToEvent').mockResolvedValue({
      ...agendaEventPayload,
      responseStatus: 'declined',
    });
    vi.spyOn(agendaService, 'deleteEvent').mockResolvedValue({ deleted: true, id: agendaEventPayload.id });

    const refreshHook = renderHook(() => useRefreshAgendaMutation(), {
      wrapper: createWrapper(queryClient),
    });
    await refreshHook.result.current.mutateAsync(interval);
    expect(queryClient.getQueryData<AgendaEventsResult>(agendaKeys.list(interval))?.degradedSources).toHaveLength(1);

    const createHook = renderHook(() => useCreateAgendaEventMutation(interval), {
      wrapper: createWrapper(queryClient),
    });
    await createHook.result.current.mutateAsync({
      calendarId: 'calendar-1',
      endAt: '2026-03-22T12:00:00.000Z',
      startAt: '2026-03-22T11:00:00.000Z',
      title: 'Planejamento semanal',
    });
    expect(queryClient.getQueryData<AgendaEventsResult>(agendaKeys.list(interval))?.events).toHaveLength(2);

    const updateHook = renderHook(() => useUpdateAgendaEventMutation(interval), {
      wrapper: createWrapper(queryClient),
    });
    await updateHook.result.current.mutateAsync({
      eventId: agendaEventPayload.id,
      values: {
        calendarId: 'calendar-1',
        endAt: agendaEventPayload.endAt,
        startAt: agendaEventPayload.startAt,
        title: 'Daily revisada',
      },
    });
    expect(queryClient.getQueryData<AgendaEventsResult>(agendaKeys.list(interval))?.events.find((event) => event.id === agendaEventPayload.id)?.title).toBe('Daily revisada');

    const respondHook = renderHook(() => useRespondAgendaEventMutation(interval), {
      wrapper: createWrapper(queryClient),
    });
    await respondHook.result.current.mutateAsync({
      eventId: agendaEventPayload.id,
      responseStatus: 'declined',
    });
    expect(queryClient.getQueryData<AgendaEventsResult>(agendaKeys.list(interval))?.events.find((event) => event.id === agendaEventPayload.id)?.responseStatus).toBe('declined');

    const deleteHook = renderHook(() => useDeleteAgendaEventMutation(interval), {
      wrapper: createWrapper(queryClient),
    });
    await deleteHook.result.current.mutateAsync(agendaEventPayload.id);
    expect(queryClient.getQueryData<AgendaEventsResult>(agendaKeys.list(interval))?.events.find((event) => event.id === agendaEventPayload.id)).toBeUndefined();

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: agendaKeys.all });
  });
});