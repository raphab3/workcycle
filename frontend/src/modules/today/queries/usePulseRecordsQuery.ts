'use client';

import { useQuery } from '@tanstack/react-query';

import { todayKeys } from '@/modules/today/queries/todayKeys';
import { todayService } from '@/modules/today/services/todayService';

interface UsePulseRecordsQueryOptions {
  cycleDate?: string;
  enabled?: boolean;
  sessionId?: string;
}

export function usePulseRecordsQuery({ cycleDate, enabled = true, sessionId }: UsePulseRecordsQueryOptions = {}) {
  const scope = sessionId ?? cycleDate ?? 'current';

  return useQuery({
    enabled,
    queryKey: todayKeys.pulseRecords(scope),
    queryFn: () => todayService.getPulseRecords({ cycleDate, sessionId }),
    retry: false,
  });
}