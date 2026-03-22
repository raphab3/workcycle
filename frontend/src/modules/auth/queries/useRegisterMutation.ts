'use client';

import { useMutation } from '@tanstack/react-query';

import { authService } from '@/modules/auth/services/authService';

export function useRegisterMutation() {
  return useMutation({
    mutationFn: authService.register,
  });
}