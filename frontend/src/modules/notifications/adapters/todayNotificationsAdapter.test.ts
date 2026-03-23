import { describe, expect, it } from 'vitest';

import {
  createActivityPulseDueNotificationEvent,
  createActivityPulseExpiredNotificationEvent,
  createTodayPulseNotificationEventId,
} from './todayNotificationsAdapter';

describe('todayNotificationsAdapter', () => {
  it('builds a stable pulse notification id from firedAt', () => {
    expect(createTodayPulseNotificationEventId('2026-03-22T09:30:00.000Z')).toBe('today-pulse:2026-03-22T09:30:00.000Z');
  });

  it('maps an active pulse to a due notification event', () => {
    expect(createActivityPulseDueNotificationEvent({
      expiresAt: '2026-03-22T09:35:00.000Z',
      firedAt: '2026-03-22T09:30:00.000Z',
      projectId: 'proj-1',
    })).toMatchObject({
      eventId: 'today-pulse:2026-03-22T09:30:00.000Z',
      type: 'activity-pulse-due',
      expiresAt: '2026-03-22T09:35:00.000Z',
    });
  });

  it('maps an expired pulse history record to an inactivity notification event', () => {
    expect(createActivityPulseExpiredNotificationEvent({
      confirmedMinutes: 0,
      firedAt: '2026-03-22T09:30:00.000Z',
      projectId: 'proj-1',
      resolution: 'pending',
      respondedAt: null,
      reviewedAt: null,
      status: 'unconfirmed',
    }, '2026-03-22T09:35:00.000Z')).toMatchObject({
      eventId: 'today-pulse:2026-03-22T09:30:00.000Z',
      occurredAt: '2026-03-22T09:35:00.000Z',
      type: 'activity-pulse-expired',
    });
  });
});