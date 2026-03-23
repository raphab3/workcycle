'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { agendaKeys } from '@/modules/agenda/queries/agendaKeys';
import { agendaService } from '@/modules/agenda/services/agendaService';

import type { AgendaEventsResult, AgendaIntervalInput } from '@/modules/agenda/types';

export function useDeleteAgendaEventMutation(interval: AgendaIntervalInput) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: agendaService.deleteEvent,
    onSuccess: (result) => {
      queryClient.setQueryData<AgendaEventsResult>(agendaKeys.list(interval), (currentState = { degradedSources: [], events: [] }) => ({
        ...currentState,
        events: currentState.events.filter((event) => event.id !== result.id),
      }));
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: agendaKeys.all });
    },
  });
}