'use client';

import { useQuery } from '@tanstack/react-query';

import { authKeys } from '@/modules/auth/queries/authKeys';
import { authService } from '@/modules/auth/services/authService';

export function useGoogleAccountsQuery() {
  return useQuery({
    queryKey: authKeys.accounts(),
    queryFn: authService.getGoogleAccounts,
    staleTime: 60_000,
    retry: false,
  });
}