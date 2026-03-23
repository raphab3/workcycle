import type { NotificationCapabilityState } from '@/modules/notifications/types/capability';
import type { DeliveryDecision } from '@/modules/notifications/types/delivery';
import type { OperationalNotificationEvent } from '@/modules/notifications/types/events';
import type { NotificationDedupeStore } from '@/modules/notifications/services/notificationDedupeStore';

interface NotificationDeliveryEngineInput {
  capability: NotificationCapabilityState;
  dedupeStore: NotificationDedupeStore;
  event: OperationalNotificationEvent;
  now?: string;
}

export function createOperationalNotificationDedupeKey(event: OperationalNotificationEvent) {
  return `${event.type}:${event.eventId}`;
}

export function decideNotificationDelivery({ capability, dedupeStore, event, now = new Date().toISOString() }: NotificationDeliveryEngineInput): DeliveryDecision {
  if (!capability.productEnabled) {
    return {
      channel: 'suppressed',
      dedupeKey: null,
      degradedReason: null,
      reason: 'product-disabled',
      shouldMarkDelivered: false,
    };
  }

  const dedupeKey = createOperationalNotificationDedupeKey(event);
  const nowMs = Date.parse(now);

  if (dedupeStore.has(dedupeKey, nowMs)) {
    return {
      channel: 'suppressed',
      dedupeKey,
      degradedReason: null,
      reason: 'duplicate-event',
      shouldMarkDelivered: false,
    };
  }

  if (event.expiresAt && Date.parse(event.expiresAt) <= nowMs) {
    return {
      channel: 'recovery',
      dedupeKey,
      degradedReason: null,
      reason: 'event-expired-before-delivery',
      shouldMarkDelivered: true,
    };
  }

  if (capability.visibilityState === 'visible' && capability.windowFocused) {
    return {
      channel: 'in-app',
      dedupeKey,
      degradedReason: null,
      reason: 'page-visible-in-app-preferred',
      shouldMarkDelivered: true,
    };
  }

  if (!capability.supportsBrowserNotification) {
    return {
      channel: 'in-app',
      dedupeKey,
      degradedReason: 'browser-unsupported',
      reason: 'browser-unsupported-fallback',
      shouldMarkDelivered: true,
    };
  }

  if (capability.permission === 'denied') {
    return {
      channel: 'in-app',
      dedupeKey,
      degradedReason: 'browser-permission-denied',
      reason: 'browser-permission-denied-fallback',
      shouldMarkDelivered: true,
    };
  }

  if (capability.permission === 'default') {
    return {
      channel: 'in-app',
      dedupeKey,
      degradedReason: 'browser-permission-default',
      reason: 'browser-permission-default-fallback',
      shouldMarkDelivered: true,
    };
  }

  return {
    channel: 'browser',
    dedupeKey,
    degradedReason: null,
    reason: 'browser-granted-background',
    shouldMarkDelivered: true,
  };
}