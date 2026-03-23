'use client';

import { useQuery } from '@tanstack/react-query';

import { weeklyKeys } from '@/modules/weekly/queries/weeklyKeys';
import { weeklyService } from '@/modules/weekly/services/weeklyService';

interface UseWeeklySnapshotQueryOptions {
  enabled?: boolean;
  weekKey?: string;
}

export function useWeeklySnapshotQuery({ enabled = true, weekKey }: UseWeeklySnapshotQueryOptions = {}) {
  return useQuery({
    enabled,
    queryKey: weeklyKeys.snapshot(weekKey ?? 'current'),
    queryFn: () => weeklyService.getWeeklySnapshot(weekKey ? { weekKey } : undefined),
    retry: false,
  });
}