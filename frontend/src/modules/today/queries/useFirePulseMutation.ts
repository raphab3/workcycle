'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { todayKeys } from '@/modules/today/queries/todayKeys';
import { todayService } from '@/modules/today/services/todayService';

import type { FirePulseInputDTO, TodaySessionDTO } from '@/modules/today/types';

export function useFirePulseMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: todayService.firePulse,
    onSuccess: (session, input: FirePulseInputDTO) => {
      queryClient.setQueryData<TodaySessionDTO>(todayKeys.session('current'), session);
      queryClient.setQueryData(todayKeys.session(session.cycleDate), session);
      queryClient.setQueryData(todayKeys.pulseRecords(input.sessionId), session.pulses.history);
    },
    onSettled: async (session) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: todayKeys.session('current') }),
        session?.id ? queryClient.invalidateQueries({ queryKey: todayKeys.pulseRecords(session.id) }) : Promise.resolve(),
      ]);
    },
  });
}