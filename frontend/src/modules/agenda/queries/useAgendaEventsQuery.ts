'use client';

import { useQuery } from '@tanstack/react-query';

import { agendaKeys } from '@/modules/agenda/queries/agendaKeys';
import { agendaService } from '@/modules/agenda/services/agendaService';

import type { AgendaIntervalInput } from '@/modules/agenda/types';

interface UseAgendaEventsQueryOptions extends AgendaIntervalInput {
  enabled?: boolean;
}

export function useAgendaEventsQuery({ enabled = true, from, to }: UseAgendaEventsQueryOptions) {
  return useQuery({
    enabled,
    queryFn: () => agendaService.getEvents({ from, to }),
    queryKey: agendaKeys.list({ from, to }),
    retry: false,
  });
}