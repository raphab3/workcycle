import { describe, expect, it } from 'vitest';

import { createPulseInactivityState } from './pulseInactivityPolicy';
import { createDailyReviewRecoveryEventId, resolveNotificationRecovery } from './notificationRecoveryService';

describe('notificationRecoveryService', () => {
  it('recovers a single pending pulse when the app returns while paused_inactivity is still active', () => {
    const resolution = resolveNotificationRecovery({
      closeDayReview: null,
      cycleDate: '2026-03-22',
      now: '2026-03-22T09:40:00.000Z',
      pulseInactivity: createPulseInactivityState('paused_inactivity', {
        confirmedMinutes: 0,
        firedAt: '2026-03-22T09:30:00.000Z',
        projectId: 'proj-1',
        resolution: 'pending',
        respondedAt: null,
        reviewedAt: null,
        status: 'unconfirmed',
      }),
      sessionState: 'paused_inactivity',
    });

    expect(resolution).toMatchObject({
      pendingEventId: 'today-pulse:2026-03-22T09:30:00.000Z:expired',
      reason: 'pulse-recovery-pending',
      resolution: 'show-in-app',
    });
    expect(resolution.event).toMatchObject({
      eventId: 'today-pulse:2026-03-22T09:30:00.000Z:expired',
      type: 'recovery-pending',
    });
  });

  it('recovers the daily review for the current cycle when no pulse recovery is pending', () => {
    const resolution = resolveNotificationRecovery({
      closeDayReview: {
        message: 'Ainda existem minutos nao confirmados no ciclo atual.',
        requiresConfirmation: true,
        unconfirmedMinutes: 30,
      },
      cycleDate: '2026-03-22',
      now: '2026-03-22T18:45:00.000Z',
      pulseInactivity: createPulseInactivityState('running', null),
      sessionState: 'running',
    });

    expect(resolution).toMatchObject({
      pendingEventId: createDailyReviewRecoveryEventId('2026-03-22'),
      reason: 'daily-review-recovery-pending',
      resolution: 'show-in-app',
    });
    expect(resolution.event).toMatchObject({
      eventId: 'daily-review:2026-03-22',
      type: 'recovery-pending',
    });
  });

  it('discards stale pending reminders after the operational day changes', () => {
    const pulseResolution = resolveNotificationRecovery({
      closeDayReview: null,
      cycleDate: '2026-03-22',
      now: '2026-03-23T08:00:00.000Z',
      pulseInactivity: createPulseInactivityState('paused_inactivity', {
        confirmedMinutes: 0,
        firedAt: '2026-03-22T09:30:00.000Z',
        projectId: 'proj-1',
        resolution: 'pending',
        respondedAt: null,
        reviewedAt: null,
        status: 'unconfirmed',
      }),
      sessionState: 'paused_inactivity',
    });

    const dailyReviewResolution = resolveNotificationRecovery({
      closeDayReview: {
        message: 'Ainda existem minutos nao confirmados no ciclo atual.',
        requiresConfirmation: true,
        unconfirmedMinutes: 30,
      },
      cycleDate: '2026-03-22',
      now: '2026-03-23T08:00:00.000Z',
      pulseInactivity: createPulseInactivityState('running', null),
      sessionState: 'running',
    });

    expect(pulseResolution).toMatchObject({
      reason: 'pulse-recovery-crossed-cycle-date',
      resolution: 'discard-stale',
    });
    expect(dailyReviewResolution).toMatchObject({
      pendingEventId: 'daily-review:2026-03-22',
      reason: 'daily-review-crossed-cycle-date',
      resolution: 'discard-stale',
    });
  });
});