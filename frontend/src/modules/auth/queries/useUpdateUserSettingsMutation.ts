'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { settingsKeys } from '@/modules/auth/queries/settingsKeys';
import { settingsService } from '@/modules/auth/services/settingsService';

import type { UserSettingsDTO } from '@/modules/auth/types';

export function useUpdateUserSettingsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: settingsService.updateUserSettings,
    onSuccess: (settings) => {
      queryClient.setQueryData<UserSettingsDTO>(settingsKeys.user(), settings);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: settingsKeys.user() });
    },
  });
}