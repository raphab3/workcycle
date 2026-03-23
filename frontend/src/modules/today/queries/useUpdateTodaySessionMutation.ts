'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { todayKeys } from '@/modules/today/queries/todayKeys';
import { todayService } from '@/modules/today/services/todayService';

import type { TodaySessionDTO, UpdateTodaySessionInput } from '@/modules/today/types';

function resolveSessionKey(input?: UpdateTodaySessionInput) {
  return todayKeys.session(input?.cycleDate ?? 'current');
}

export function useUpdateTodaySessionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: todayService.updateTodaySession,
    onSuccess: (session, input) => {
      queryClient.setQueryData<TodaySessionDTO>(resolveSessionKey(input), session);
      queryClient.setQueryData(todayKeys.pulseRecords(session.id ?? 'current'), session.pulses.history);
    },
    onSettled: async (_session, _error, input) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: resolveSessionKey(input) }),
        queryClient.invalidateQueries({ queryKey: todayKeys.all }),
      ]);
    },
  });
}