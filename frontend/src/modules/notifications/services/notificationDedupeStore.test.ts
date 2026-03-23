import { describe, expect, it, vi } from 'vitest';

import { createMemoryNotificationDedupeStore } from './notificationDedupeStore';

describe('notificationDedupeStore', () => {
  it('marks events and suppresses duplicates within the ttl window', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-22T10:00:00.000Z'));

    const store = createMemoryNotificationDedupeStore({ ttlMs: 1_000 });

    expect(store.has('activity-pulse-due:event-1')).toBe(false);

    store.mark('activity-pulse-due:event-1');

    expect(store.has('activity-pulse-due:event-1')).toBe(true);

    vi.useRealTimers();
  });

  it('expires old dedupe entries after the ttl window', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-22T10:00:00.000Z'));

    const store = createMemoryNotificationDedupeStore({ ttlMs: 1_000 });

    store.mark('activity-pulse-due:event-1');

    vi.advanceTimersByTime(1_001);

    expect(store.has('activity-pulse-due:event-1')).toBe(false);
    expect(store.size()).toBe(0);

    vi.useRealTimers();
  });
});