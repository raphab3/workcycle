import { api } from '@/lib/axios';

import type { UpdateUserSettingsInput, UserSettingsDTO } from '@/modules/auth/types';

async function getUserSettings() {
  const response = await api.get<UserSettingsDTO>('/api/settings');

  return response.data;
}

async function updateUserSettings(input: UpdateUserSettingsInput) {
  const response = await api.patch<UserSettingsDTO>('/api/settings', input);

  return response.data;
}

export const settingsService = {
  getUserSettings,
  updateUserSettings,
};