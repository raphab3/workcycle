'use client';

import { useQuery } from '@tanstack/react-query';

import { weeklyKeys } from '@/modules/weekly/queries/weeklyKeys';
import { weeklyService } from '@/modules/weekly/services/weeklyService';

interface UseWeeklyHistoryQueryOptions {
  enabled?: boolean;
  fromWeekKey?: string;
  limit?: number;
  toWeekKey?: string;
}

function buildHistoryScope(options: UseWeeklyHistoryQueryOptions) {
  return `${options.fromWeekKey ?? 'default'}:${options.toWeekKey ?? 'default'}:${options.limit ?? 'default'}`;
}

export function useWeeklyHistoryQuery(options: UseWeeklyHistoryQueryOptions = {}) {
  const { enabled = true, fromWeekKey, limit, toWeekKey } = options;

  return useQuery({
    enabled,
    queryKey: weeklyKeys.history(buildHistoryScope(options)),
    queryFn: () => weeklyService.getWeeklyHistory({ fromWeekKey, limit, toWeekKey }),
    retry: false,
  });
}