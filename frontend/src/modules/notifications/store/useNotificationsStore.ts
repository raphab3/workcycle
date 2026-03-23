'use client';

import { create } from 'zustand';

import { createMemoryNotificationDedupeStore } from '@/modules/notifications/services/notificationDedupeStore';
import { decideNotificationDelivery } from '@/modules/notifications/services/notificationDeliveryEngine';
import {
  createInitialPulseInactivityState,
  isPulseNotificationEventActionable,
  shouldSuppressPulseNotificationEvent,
} from '@/modules/notifications/services/pulseInactivityPolicy';

import type { PulseInactivityState } from '@/modules/notifications/services/pulseInactivityPolicy';
import type { NotificationCapabilityState } from '@/modules/notifications/types/capability';
import type { DeliveryDecision, NotificationDeliveryAttempt } from '@/modules/notifications/types/delivery';
import type { InAppNotificationState, OperationalNotificationEvent } from '@/modules/notifications/types/events';

const dedupeStore = createMemoryNotificationDedupeStore();

function emitBrowserNotification(event: OperationalNotificationEvent, dedupeKey: string | null) {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') {
    throw new Error('Browser notification delivery is unavailable.');
  }

  return new Notification(event.title, {
    body: event.message,
    tag: dedupeKey ?? undefined,
  });
}

function createDeliveryAttempt(event: OperationalNotificationEvent, decision: DeliveryDecision, deliveredAt: string): NotificationDeliveryAttempt {
  return {
    channel: decision.channel,
    context: event.context,
    dedupeKey: decision.dedupeKey,
    degradedReason: decision.degradedReason,
    deliveredAt,
    eventId: event.eventId,
    eventType: event.type,
    reason: decision.reason,
  };
}

function createPulseSuppressionAttempt(pulseInactivity: PulseInactivityState, deliveredAt: string): NotificationDeliveryAttempt | null {
  if (!pulseInactivity.activeExpiredEventId || !pulseInactivity.suppressFurtherPulseAlerts) {
    return null;
  }

  return {
    channel: 'suppressed',
    context: {
      activeExpiredEventId: pulseInactivity.activeExpiredEventId,
      source: 'pulse-inactivity-policy',
      suppressedSince: pulseInactivity.suppressedSince,
    },
    dedupeKey: null,
    degradedReason: null,
    deliveredAt,
    eventId: pulseInactivity.activeExpiredEventId,
    eventType: 'activity-pulse-expired',
    reason: 'paused-inactivity-active',
  };
}

interface NotificationsStoreState {
  activeInAppNotification: InAppNotificationState | null;
  degradedReason: DeliveryDecision['degradedReason'];
  deliveryAttempts: NotificationDeliveryAttempt[];
  lastDeliveryDecision: DeliveryDecision | null;
  pulseInactivity: PulseInactivityState;
  dismissInAppNotification: () => void;
  dismissNotificationEvent: (eventId: string) => void;
  isNotificationEventActionable: (eventId: string) => boolean;
  dispatchEvent: (event: OperationalNotificationEvent, capability: NotificationCapabilityState, now?: string) => DeliveryDecision;
  resetNotificationsStore: () => void;
  syncPulseInactivityState: (pulseInactivity: PulseInactivityState, now?: string) => void;
}

const initialState = {
  activeInAppNotification: null,
  degradedReason: null,
  deliveryAttempts: [] as NotificationDeliveryAttempt[],
  lastDeliveryDecision: null as DeliveryDecision | null,
  pulseInactivity: createInitialPulseInactivityState(),
};

export const useNotificationsStore = create<NotificationsStoreState>((set, get) => ({
  ...initialState,
  dismissInAppNotification: () => set({ activeInAppNotification: null }),
  dismissNotificationEvent: (eventId) => set((state) => ({
    activeInAppNotification: state.activeInAppNotification?.eventId === eventId
      ? null
      : state.activeInAppNotification,
  })),
  isNotificationEventActionable: (eventId) => isPulseNotificationEventActionable(get().pulseInactivity, eventId),
  dispatchEvent: (event, capability, now = new Date().toISOString()) => {
    if (shouldSuppressPulseNotificationEvent(get().pulseInactivity, event)) {
      const decision: DeliveryDecision = {
        channel: 'suppressed',
        dedupeKey: null,
        degradedReason: null,
        reason: 'paused-inactivity-active',
        shouldMarkDelivered: false,
      };
      const attempt = createDeliveryAttempt(event, decision, now);

      set((state) => ({
        deliveryAttempts: [...state.deliveryAttempts, attempt].slice(-20),
        lastDeliveryDecision: decision,
      }));

      return decision;
    }

    let decision = decideNotificationDelivery({ capability, dedupeStore, event, now });

    if (decision.channel === 'browser') {
      try {
        emitBrowserNotification(event, decision.dedupeKey);
      } catch {
        decision = {
          channel: 'in-app',
          dedupeKey: decision.dedupeKey,
          degradedReason: 'browser-delivery-failed',
          reason: 'browser-delivery-failed-fallback',
          shouldMarkDelivered: true,
        };
      }
    }

    if (decision.shouldMarkDelivered && decision.dedupeKey) {
      dedupeStore.mark(decision.dedupeKey, Date.parse(now));
    }

    const attempt = createDeliveryAttempt(event, decision, now);

    set((state) => ({
      activeInAppNotification: decision.channel === 'in-app'
        ? {
            eventId: event.eventId,
            message: event.message,
            occurredAt: event.occurredAt,
            title: event.title,
            type: event.type,
          }
        : state.activeInAppNotification,
      degradedReason: decision.degradedReason,
      deliveryAttempts: [...state.deliveryAttempts, attempt].slice(-20),
      lastDeliveryDecision: decision,
    }));

    return decision;
  },
  resetNotificationsStore: () => {
    dedupeStore.reset();
    set(initialState);
  },
  syncPulseInactivityState: (pulseInactivity, now = new Date().toISOString()) => {
    set((state) => {
      const shouldRecordSuppression = pulseInactivity.suppressFurtherPulseAlerts && (
        !state.pulseInactivity.suppressFurtherPulseAlerts
        || state.pulseInactivity.activeExpiredEventId !== pulseInactivity.activeExpiredEventId
      );
      const suppressionAttempt = shouldRecordSuppression
        ? createPulseSuppressionAttempt(pulseInactivity, now)
        : null;

      return {
        pulseInactivity,
        deliveryAttempts: suppressionAttempt
          ? [...state.deliveryAttempts, suppressionAttempt].slice(-20)
          : state.deliveryAttempts,
      };
    });
  },
}));

export function resetNotificationsStore() {
  useNotificationsStore.getState().resetNotificationsStore();
}