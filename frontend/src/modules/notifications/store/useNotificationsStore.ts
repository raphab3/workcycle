'use client';

import { create } from 'zustand';

import { createMemoryNotificationDedupeStore } from '@/modules/notifications/services/notificationDedupeStore';
import { decideNotificationDelivery } from '@/modules/notifications/services/notificationDeliveryEngine';

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
    dedupeKey: decision.dedupeKey,
    degradedReason: decision.degradedReason,
    deliveredAt,
    eventId: event.eventId,
    reason: decision.reason,
  };
}

interface NotificationsStoreState {
  activeInAppNotification: InAppNotificationState | null;
  degradedReason: DeliveryDecision['degradedReason'];
  deliveryAttempts: NotificationDeliveryAttempt[];
  lastDeliveryDecision: DeliveryDecision | null;
  dismissInAppNotification: () => void;
  dispatchEvent: (event: OperationalNotificationEvent, capability: NotificationCapabilityState, now?: string) => DeliveryDecision;
  resetNotificationsStore: () => void;
}

const initialState = {
  activeInAppNotification: null,
  degradedReason: null,
  deliveryAttempts: [] as NotificationDeliveryAttempt[],
  lastDeliveryDecision: null as DeliveryDecision | null,
};

export const useNotificationsStore = create<NotificationsStoreState>((set) => ({
  ...initialState,
  dismissInAppNotification: () => set({ activeInAppNotification: null }),
  dispatchEvent: (event, capability, now = new Date().toISOString()) => {
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
}));

export function resetNotificationsStore() {
  useNotificationsStore.getState().resetNotificationsStore();
}