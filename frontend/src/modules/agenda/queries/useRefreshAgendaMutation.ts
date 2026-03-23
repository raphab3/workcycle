'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { agendaKeys } from '@/modules/agenda/queries/agendaKeys';
import { agendaService } from '@/modules/agenda/services/agendaService';

export function useRefreshAgendaMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: agendaService.refreshEvents,
    onSuccess: (result, input) => {
      queryClient.setQueryData(agendaKeys.list(input), result);
    },
    onSettled: async (_result, _error, input) => {
      await queryClient.invalidateQueries({ queryKey: agendaKeys.list(input) });
    },
  });
}