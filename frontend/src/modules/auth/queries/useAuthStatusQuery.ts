'use client';

import { useQuery } from '@tanstack/react-query';

import { authService } from '@/modules/auth/services/authService';
import { authKeys } from '@/modules/auth/queries/authKeys';

export function useAuthStatusQuery() {
  return useQuery({
    queryKey: authKeys.status(),
    queryFn: authService.getAuthStatus,
    staleTime: 60_000,
  });
}