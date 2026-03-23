'use client';

import { useQuery } from '@tanstack/react-query';

import { todayKeys } from '@/modules/today/queries/todayKeys';
import { todayService } from '@/modules/today/services/todayService';

interface UseTodaySessionQueryOptions {
  cycleDate?: string;
  enabled?: boolean;
}

export function useTodaySessionQuery({ cycleDate, enabled = true }: UseTodaySessionQueryOptions = {}) {
  return useQuery({
    enabled,
    queryKey: todayKeys.session(cycleDate ?? 'current'),
    queryFn: () => todayService.getTodaySession(cycleDate),
    retry: false,
  });
}