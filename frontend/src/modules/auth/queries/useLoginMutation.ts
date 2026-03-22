'use client';

import { useMutation } from '@tanstack/react-query';

import { authService } from '@/modules/auth/services/authService';

export function useLoginMutation() {
  return useMutation({
    mutationFn: authService.login,
  });
}