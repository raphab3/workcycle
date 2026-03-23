'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { agendaKeys } from '@/modules/agenda/queries/agendaKeys';
import { agendaService } from '@/modules/agenda/services/agendaService';
import { isAgendaEventWithinInterval, sortAgendaEvents } from '@/modules/agenda/utils/agenda';

import type { AgendaEventsResult, AgendaIntervalInput } from '@/modules/agenda/types';

export function useCreateAgendaEventMutation(interval: AgendaIntervalInput) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: agendaService.createEvent,
    onSuccess: (event) => {
      queryClient.setQueryData<AgendaEventsResult>(agendaKeys.list(interval), (currentState = { degradedSources: [], events: [] }) => {
        const nextEvents = isAgendaEventWithinInterval(event, interval)
          ? sortAgendaEvents([event, ...currentState.events.filter((currentEvent) => currentEvent.id !== event.id)])
          : currentState.events;

        return {
          ...currentState,
          events: nextEvents,
        };
      });
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: agendaKeys.all });
    },
  });
}