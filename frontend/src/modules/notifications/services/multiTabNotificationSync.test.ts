import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  claimMultiTabNotificationEvent,
  clearMultiTabNotificationClaims,
  subscribeToReminderHistorySync,
} from './multiTabNotificationSync';
import { persistReminderHistory, REMINDER_HISTORY_STORAGE_KEY } from './reminderHistoryStorage';

describe('multiTabNotificationSync', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('claims the first delivery and suppresses a concurrent duplicate', () => {
    expect(claimMultiTabNotificationEvent('activity-pulse-due:event-1', '2026-03-22T10:00:00.000Z')).toBe(false);
    expect(claimMultiTabNotificationEvent('activity-pulse-due:event-1', '2026-03-22T10:00:01.000Z')).toBe(true);
  });

  it('allows delivery again after the claim window expires', () => {
    expect(claimMultiTabNotificationEvent('activity-pulse-due:event-1', '2026-03-22T10:00:00.000Z', 500)).toBe(false);
    expect(claimMultiTabNotificationEvent('activity-pulse-due:event-1', '2026-03-22T10:00:01.000Z', 500)).toBe(false);
  });

  it('reacts to reminder history updates from another tab through the storage event', () => {
    const onHistoryChange = vi.fn();
    const dispose = subscribeToReminderHistorySync(onHistoryChange);

    persistReminderHistory([
      {
        contextLabel: 'Pulso expirado',
        eventId: 'event-1',
        occurredAt: '2026-03-22T10:00:00.000Z',
        status: 'suppressed',
        type: 'activity-pulse-expired',
      },
    ]);

    window.dispatchEvent(new StorageEvent('storage', {
      key: REMINDER_HISTORY_STORAGE_KEY,
      newValue: window.localStorage.getItem(REMINDER_HISTORY_STORAGE_KEY),
    }));

    expect(onHistoryChange).toHaveBeenCalledWith([
      {
        contextLabel: 'Pulso expirado',
        eventId: 'event-1',
        occurredAt: '2026-03-22T10:00:00.000Z',
        status: 'suppressed',
        type: 'activity-pulse-expired',
      },
    ]);

    dispose();
    clearMultiTabNotificationClaims();
  });
});