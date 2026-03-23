import { createTodayPulseNotificationEventId } from '@/modules/notifications/adapters/todayNotificationsAdapter';
import type { OperationalNotificationEvent } from '@/modules/notifications/types/events';
import type { PulseRecord, SessionState } from '@/modules/today/types';

export interface PulseInactivityState {
  activeExpiredEventId: string | null;
  suppressFurtherPulseAlerts: boolean;
  suppressedSince: string | null;
}

export function createInitialPulseInactivityState(): PulseInactivityState {
  return {
    activeExpiredEventId: null,
    suppressFurtherPulseAlerts: false,
    suppressedSince: null,
  };
}

export function createPulseInactivityState(sessionState: SessionState, latestPulse: PulseRecord | null): PulseInactivityState {
  if (
    sessionState !== 'paused_inactivity'
    || !latestPulse
    || latestPulse.status !== 'unconfirmed'
    || latestPulse.resolution !== 'pending'
  ) {
    return createInitialPulseInactivityState();
  }

  return {
    activeExpiredEventId: createTodayPulseNotificationEventId(latestPulse.firedAt, 'expired'),
    suppressFurtherPulseAlerts: true,
    suppressedSince: latestPulse.firedAt,
  };
}

export function shouldSuppressPulseNotificationEvent(
  pulseInactivityState: PulseInactivityState,
  event: OperationalNotificationEvent,
) {
  if (!pulseInactivityState.suppressFurtherPulseAlerts) {
    return false;
  }

  if (event.type === 'activity-pulse-due') {
    return true;
  }

  if (event.type !== 'activity-pulse-expired') {
    return false;
  }

  return pulseInactivityState.activeExpiredEventId !== event.eventId;
}

export function isPulseNotificationEventActionable(
  pulseInactivityState: PulseInactivityState,
  eventId: string,
) {
  if (!pulseInactivityState.suppressFurtherPulseAlerts) {
    return true;
  }

  return pulseInactivityState.activeExpiredEventId === eventId;
}