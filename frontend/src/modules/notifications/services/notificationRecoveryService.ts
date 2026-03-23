import { getLocalISODate } from '@/modules/today/utils/boundary';

import type { PulseInactivityState } from '@/modules/notifications/services/pulseInactivityPolicy';
import type { OperationalNotificationEvent } from '@/modules/notifications/types/events';
import type { CloseDayReview, SessionState } from '@/modules/today/types';

export interface RecoveryResolution {
  event: OperationalNotificationEvent | null;
  pendingEventId: string | null;
  reason: string;
  resolution: 'none' | 'show-in-app' | 'discard-stale';
}

interface ResolveNotificationRecoveryInput {
  closeDayReview: CloseDayReview | null;
  cycleDate: string;
  now?: string;
  pulseInactivity: PulseInactivityState;
  sessionState: SessionState;
}

export function createDailyReviewRecoveryEventId(cycleDate: string) {
  return `daily-review:${cycleDate}`;
}

export function resolveNotificationRecovery({
  closeDayReview,
  cycleDate,
  now = new Date().toISOString(),
  pulseInactivity,
  sessionState,
}: ResolveNotificationRecoveryInput): RecoveryResolution {
  const currentOperationalDate = getLocalISODate(new Date(now));

  if (pulseInactivity.suppressFurtherPulseAlerts && pulseInactivity.activeExpiredEventId) {
    if (currentOperationalDate !== cycleDate) {
      return {
        event: null,
        pendingEventId: pulseInactivity.activeExpiredEventId,
        reason: 'pulse-recovery-crossed-cycle-date',
        resolution: 'discard-stale',
      };
    }

    if (sessionState !== 'paused_inactivity') {
      return {
        event: null,
        pendingEventId: pulseInactivity.activeExpiredEventId,
        reason: 'pulse-recovery-session-no-longer-paused',
        resolution: 'discard-stale',
      };
    }

    return {
      event: {
        context: {
          cycleDate,
          sourceEventId: pulseInactivity.activeExpiredEventId,
          sourceType: 'activity-pulse-expired',
          suppressedSince: pulseInactivity.suppressedSince,
        },
        eventId: pulseInactivity.activeExpiredEventId,
        message: 'Voce voltou com uma sessao pausada por inatividade. Revise o pulso pendente antes de continuar.',
        occurredAt: now,
        title: 'Pulso pendente de regularizacao',
        type: 'recovery-pending',
      },
      pendingEventId: pulseInactivity.activeExpiredEventId,
      reason: 'pulse-recovery-pending',
      resolution: 'show-in-app',
    };
  }

  if (closeDayReview?.requiresConfirmation) {
    const eventId = createDailyReviewRecoveryEventId(cycleDate);

    if (currentOperationalDate !== cycleDate) {
      return {
        event: null,
        pendingEventId: eventId,
        reason: 'daily-review-crossed-cycle-date',
        resolution: 'discard-stale',
      };
    }

    return {
      event: {
        context: {
          cycleDate,
          sourceType: 'daily-review-due',
          unconfirmedMinutes: closeDayReview.unconfirmedMinutes,
        },
        eventId,
        message: closeDayReview.message ?? 'Existe uma revisao diaria pendente para o ciclo atual.',
        occurredAt: now,
        title: 'Revisao diaria pendente',
        type: 'recovery-pending',
      },
      pendingEventId: eventId,
      reason: 'daily-review-recovery-pending',
      resolution: 'show-in-app',
    };
  }

  return {
    event: null,
    pendingEventId: null,
    reason: 'no-recovery-pending',
    resolution: 'none',
  };
}