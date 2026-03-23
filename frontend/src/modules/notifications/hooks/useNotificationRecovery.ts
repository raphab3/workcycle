'use client';

import { useEffect, useRef } from 'react';

import { useNotificationCapability } from '@/modules/notifications/hooks/useNotificationCapability';
import { resolveNotificationRecovery } from '@/modules/notifications/services/notificationRecoveryService';
import { useNotificationsStore } from '@/modules/notifications/store/useNotificationsStore';
import { useWorkspaceStore } from '@/shared/store/useWorkspaceStore';

interface UseNotificationRecoveryOptions {
  enabled?: boolean;
}

export function useNotificationRecovery(options?: UseNotificationRecoveryOptions) {
  const capability = useNotificationCapability({ enabled: options?.enabled ?? true });
  const cycleDate = useWorkspaceStore((state) => state.cycleDate);
  const closeDayReview = useWorkspaceStore((state) => state.closeDayReview);
  const sessionState = useWorkspaceStore((state) => state.sessionState);
  const pulseInactivity = useNotificationsStore((state) => state.pulseInactivity);
  const dispatchEvent = useNotificationsStore((state) => state.dispatchEvent);
  const dismissNotificationEvent = useNotificationsStore((state) => state.dismissNotificationEvent);
  const wasAppActiveRef = useRef(false);
  const appIsActive = capability.visibilityState === 'visible' && capability.windowFocused;

  useEffect(() => {
    if (!appIsActive) {
      wasAppActiveRef.current = false;
      return;
    }

    if (wasAppActiveRef.current) {
      return;
    }

    wasAppActiveRef.current = true;

    const now = new Date().toISOString();
    const resolution = resolveNotificationRecovery({
      closeDayReview,
      cycleDate,
      now,
      pulseInactivity,
      sessionState,
    });

    if (resolution.resolution === 'show-in-app' && resolution.event) {
      dispatchEvent(resolution.event, capability, now);
      return;
    }

    if (resolution.resolution === 'discard-stale' && resolution.pendingEventId) {
      dismissNotificationEvent(resolution.pendingEventId);
    }
  }, [appIsActive, capability, closeDayReview, cycleDate, dismissNotificationEvent, dispatchEvent, pulseInactivity, sessionState]);
}