'use client';

import { useSyncExternalStore } from 'react';

import { useUserSettingsQuery } from '@/modules/settings';
import {
  getBrowserNotificationCapabilitySnapshot,
  getServerNotificationCapabilitySnapshot,
  subscribeToBrowserNotificationCapability,
} from '@/modules/notifications/services/browserNotificationCapability';

interface UseNotificationCapabilityOptions {
  enabled?: boolean;
}

export function useNotificationCapability(options?: UseNotificationCapabilityOptions) {
  const settingsQuery = useUserSettingsQuery({ enabled: options?.enabled ?? true });
  const productEnabled = settingsQuery.data?.notificationsEnabled ?? false;

  return useSyncExternalStore(
    subscribeToBrowserNotificationCapability,
    () => getBrowserNotificationCapabilitySnapshot(productEnabled),
    () => getServerNotificationCapabilitySnapshot(productEnabled),
  );
}