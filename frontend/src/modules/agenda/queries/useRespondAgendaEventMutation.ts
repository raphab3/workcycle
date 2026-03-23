'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { agendaKeys } from '@/modules/agenda/queries/agendaKeys';
import { agendaService } from '@/modules/agenda/services/agendaService';
import { isAgendaEventWithinInterval, sortAgendaEvents } from '@/modules/agenda/utils/agenda';

import type { AgendaEventsResult, AgendaIntervalInput } from '@/modules/agenda/types';

export function useRespondAgendaEventMutation(interval: AgendaIntervalInput) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: agendaService.respondToEvent,
    onSuccess: (event) => {
      queryClient.setQueryData<AgendaEventsResult>(agendaKeys.list(interval), (currentState = { degradedSources: [], events: [] }) => {
        const remainingEvents = currentState.events.filter((currentEvent) => currentEvent.id !== event.id);
        const nextEvents = isAgendaEventWithinInterval(event, interval)
          ? sortAgendaEvents([event, ...remainingEvents])
          : remainingEvents;

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