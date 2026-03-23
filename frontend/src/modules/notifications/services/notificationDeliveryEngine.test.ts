import { describe, expect, it } from 'vitest';

import { createMemoryNotificationDedupeStore } from './notificationDedupeStore';
import { createOperationalNotificationDedupeKey, decideNotificationDelivery } from './notificationDeliveryEngine';

import type { NotificationCapabilityState } from '@/modules/notifications/types/capability';

const baseCapability: NotificationCapabilityState = {
  permission: 'granted',
  productEnabled: true,
  supportsBrowserNotification: true,
  visibilityState: 'hidden',
  windowFocused: false,
};

const baseEvent = {
  eventId: 'event-1',
  message: 'Confirme sua atividade operacional.',
  occurredAt: '2026-03-22T10:00:00.000Z',
  title: 'Pulso de atividade',
  type: 'activity-pulse-due' as const,
};

describe('notificationDeliveryEngine', () => {
  it('builds a stable dedupe key from event type and id', () => {
    expect(createOperationalNotificationDedupeKey(baseEvent)).toBe('activity-pulse-due:event-1');
  });

  it('prefers in-app delivery when the page is visible and focused', () => {
    const dedupeStore = createMemoryNotificationDedupeStore();

    expect(decideNotificationDelivery({
      capability: {
        ...baseCapability,
        visibilityState: 'visible',
        windowFocused: true,
      },
      dedupeStore,
      event: baseEvent,
    })).toMatchObject({
      channel: 'in-app',
      degradedReason: null,
      reason: 'page-visible-in-app-preferred',
    });
  });

  it('uses browser delivery when permission is granted in the background', () => {
    const dedupeStore = createMemoryNotificationDedupeStore();

    expect(decideNotificationDelivery({ capability: baseCapability, dedupeStore, event: baseEvent })).toMatchObject({
      channel: 'browser',
      degradedReason: null,
      reason: 'browser-granted-background',
    });
  });

  it('falls back to in-app delivery with degraded reason when permission is denied', () => {
    const dedupeStore = createMemoryNotificationDedupeStore();

    expect(decideNotificationDelivery({
      capability: {
        ...baseCapability,
        permission: 'denied',
      },
      dedupeStore,
      event: baseEvent,
    })).toMatchObject({
      channel: 'in-app',
      degradedReason: 'browser-permission-denied',
      reason: 'browser-permission-denied-fallback',
    });
  });

  it('suppresses duplicate events already marked in dedupe memory', () => {
    const dedupeStore = createMemoryNotificationDedupeStore();
    const dedupeKey = createOperationalNotificationDedupeKey(baseEvent);

    dedupeStore.mark(dedupeKey, Date.parse(baseEvent.occurredAt));

    expect(decideNotificationDelivery({
      capability: baseCapability,
      dedupeStore,
      event: baseEvent,
      now: '2026-03-22T10:00:01.000Z',
    })).toMatchObject({
      channel: 'suppressed',
      reason: 'duplicate-event',
    });
  });

  it('routes expired events to recovery instead of active delivery', () => {
    const dedupeStore = createMemoryNotificationDedupeStore();

    expect(decideNotificationDelivery({
      capability: baseCapability,
      dedupeStore,
      event: {
        ...baseEvent,
        expiresAt: '2026-03-22T10:00:00.000Z',
      },
      now: '2026-03-22T10:01:00.000Z',
    })).toMatchObject({
      channel: 'recovery',
      reason: 'event-expired-before-delivery',
    });
  });

  it('suppresses delivery when the product preference is disabled', () => {
    const dedupeStore = createMemoryNotificationDedupeStore();

    expect(decideNotificationDelivery({
      capability: {
        ...baseCapability,
        productEnabled: false,
      },
      dedupeStore,
      event: baseEvent,
    })).toMatchObject({
      channel: 'suppressed',
      reason: 'product-disabled',
    });
  });
});