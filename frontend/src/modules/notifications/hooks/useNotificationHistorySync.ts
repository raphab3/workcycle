'use client';

import { useEffect } from 'react';

import { subscribeToReminderHistorySync } from '@/modules/notifications/services/multiTabNotificationSync';
import { useNotificationsStore } from '@/modules/notifications/store/useNotificationsStore';

export function useNotificationHistorySync() {
  const hydrateReminderHistory = useNotificationsStore((state) => state.hydrateReminderHistory);
  const replaceReminderHistory = useNotificationsStore((state) => state.replaceReminderHistory);

  useEffect(() => {
    hydrateReminderHistory();

    return subscribeToReminderHistorySync((items) => {
      replaceReminderHistory(items);
    });
  }, [hydrateReminderHistory, replaceReminderHistory]);
}