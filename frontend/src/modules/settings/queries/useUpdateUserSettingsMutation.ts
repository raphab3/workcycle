'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { settingsKeys } from '@/modules/settings/queries/settingsKeys';
import { settingsService } from '@/modules/settings/services/settingsService';

import type { UserSettingsDTO } from '@/modules/settings/types';

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