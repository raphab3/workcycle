'use client';

import { useQuery } from '@tanstack/react-query';

import { authKeys } from '@/modules/auth/queries/authKeys';
import { authService } from '@/modules/auth/services/authService';

interface UseGoogleAccountsQueryOptions {
  enabled?: boolean;
}

export function useGoogleAccountsQuery(options?: UseGoogleAccountsQueryOptions) {
  return useQuery({
    enabled: options?.enabled ?? true,
    queryKey: authKeys.accounts(),
    queryFn: authService.getGoogleAccounts,
    staleTime: 60_000,
    retry: false,
  });
}