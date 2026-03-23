'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { authKeys } from '@/modules/auth/queries/authKeys';
import { authService } from '@/modules/auth/services/authService';

import type { GoogleAccountDTO } from '@/modules/auth/types';

export function useUpdateGoogleCalendarMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.updateGoogleCalendar,
    onSuccess: (calendar) => {
      queryClient.setQueryData<GoogleAccountDTO[]>(authKeys.accounts(), (currentAccounts = []) => currentAccounts.map((account) => {
        if (account.id !== calendar.accountId) {
          return account;
        }

        return {
          ...account,
          calendars: account.calendars.map((currentCalendar) => (
            currentCalendar.id === calendar.id ? calendar : currentCalendar
          )),
        };
      }));
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: authKeys.accounts() });
    },
  });
}