'use client';

import { useQuery } from '@tanstack/react-query';

import { settingsKeys } from '@/modules/settings/queries/settingsKeys';
import { settingsService } from '@/modules/settings/services/settingsService';

interface UseUserSettingsQueryOptions {
  enabled?: boolean;
}

export function useUserSettingsQuery(options?: UseUserSettingsQueryOptions) {
  return useQuery({
    enabled: options?.enabled ?? true,
    queryKey: settingsKeys.user(),
    queryFn: settingsService.getUserSettings,
    staleTime: 60_000,
    retry: false,
  });
}