'use client';

import { create } from 'zustand';

import {
  claimMultiTabNotificationEvent,
  clearMultiTabNotificationClaims,
} from '@/modules/notifications/services/multiTabNotificationSync';
import { createMemoryNotificationDedupeStore } from '@/modules/notifications/services/notificationDedupeStore';
import { decideNotificationDelivery } from '@/modules/notifications/services/notificationDeliveryEngine';
import {
  createInitialPulseInactivityState,
  isPulseNotificationEventActionable,
  shouldSuppressPulseNotificationEvent,
} from '@/modules/notifications/services/pulseInactivityPolicy';
import {
  clearReminderHistoryStorage,
  persistReminderHistory,
  readReminderHistory,
} from '@/modules/notifications/services/reminderHistoryStorage';

import type { PulseInactivityState } from '@/modules/notifications/services/pulseInactivityPolicy';
import type { NotificationCapabilityState } from '@/modules/notifications/types/capability';
import type { DeliveryDecision, NotificationDeliveryAttempt } from '@/modules/notifications/types/delivery';
import type { InAppNotificationState, OperationalNotificationEvent } from '@/modules/notifications/types/events';
import type { ReminderHistoryItem, ReminderHistoryStatus } from '@/modules/notifications/types/history';

const dedupeStore = createMemoryNotificationDedupeStore();

function buildReminderHistoryContextLabel(eventType: NotificationDeliveryAttempt['eventType'], context?: NotificationDeliveryAttempt['context']) {
  const sourceType = typeof context?.sourceType === 'string' ? context.sourceType : null;

  if (eventType === 'recovery-pending' && sourceType === 'daily-review-due') {
    return 'Recovery de revisao diaria';
  }

  if (eventType === 'recovery-pending' && sourceType === 'activity-pulse-expired') {
    return 'Recovery de pulso expirado';
  }

  if (eventType === 'activity-pulse-due') {
    return 'Pulso de atividade';
  }

  if (eventType === 'activity-pulse-expired') {
    return 'Pulso expirado';
  }

  if (eventType === 'daily-review-due') {
    return 'Revisao diaria';
  }

  if (eventType === 'recovery-pending') {
    return 'Recovery pendente';
  }

  return null;
}

function buildReminderHistoryStatus(attempt: NotificationDeliveryAttempt): ReminderHistoryStatus {
  if (attempt.channel === 'suppressed') {
    return 'suppressed';
  }

  if (attempt.channel === 'recovery') {
    return 'missed';
  }

  return 'shown';
}

function upsertReminderHistoryItem(
  currentItems: ReminderHistoryItem[],
  nextItem: ReminderHistoryItem,
) {
  const withoutPrevious = currentItems.filter((item) => item.eventId !== nextItem.eventId);

  return [nextItem, ...withoutPrevious].slice(0, 20);
}

function createReminderHistoryItem(attempt: NotificationDeliveryAttempt): ReminderHistoryItem {
  return {
    contextLabel: buildReminderHistoryContextLabel(attempt.eventType, attempt.context),
    eventId: attempt.eventId,
    occurredAt: attempt.deliveredAt,
    status: buildReminderHistoryStatus(attempt),
    type: attempt.eventType,
  };
}

function persistNextReminderHistory(items: ReminderHistoryItem[]) {
  persistReminderHistory(items);
  return items;
}

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
  reminderHistory: ReminderHistoryItem[];
  dismissInAppNotification: () => void;
  dismissNotificationEvent: (eventId: string) => void;
  hydrateReminderHistory: () => void;
  isNotificationEventActionable: (eventId: string) => boolean;
  dispatchEvent: (event: OperationalNotificationEvent, capability: NotificationCapabilityState, now?: string) => DeliveryDecision;
  replaceReminderHistory: (items: ReminderHistoryItem[]) => void;
  resetNotificationsStore: () => void;
  syncPulseInactivityState: (pulseInactivity: PulseInactivityState, now?: string) => void;
}

const initialState = {
  activeInAppNotification: null,
  degradedReason: null,
  deliveryAttempts: [] as NotificationDeliveryAttempt[],
  lastDeliveryDecision: null as DeliveryDecision | null,
  pulseInactivity: createInitialPulseInactivityState(),
  reminderHistory: [] as ReminderHistoryItem[],
};

export const useNotificationsStore = create<NotificationsStoreState>((set, get) => ({
  ...initialState,
  dismissInAppNotification: () => set({ activeInAppNotification: null }),
  dismissNotificationEvent: (eventId) => set((state) => {
    const nextHistory = state.reminderHistory.some((item) => item.eventId === eventId)
      ? persistNextReminderHistory(upsertReminderHistoryItem(state.reminderHistory, {
        contextLabel: state.reminderHistory.find((item) => item.eventId === eventId)?.contextLabel ?? null,
        eventId,
        occurredAt: new Date().toISOString(),
        status: 'resolved',
        type: state.reminderHistory.find((item) => item.eventId === eventId)?.type ?? 'recovery-pending',
      }))
      : state.reminderHistory;

    return {
      activeInAppNotification: state.activeInAppNotification?.eventId === eventId
        ? null
        : state.activeInAppNotification,
      reminderHistory: nextHistory,
    };
  }),
  hydrateReminderHistory: () => {
    set({ reminderHistory: readReminderHistory() });
  },
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
        reminderHistory: persistNextReminderHistory(
          upsertReminderHistoryItem(state.reminderHistory, createReminderHistoryItem(attempt)),
        ),
      }));

      return decision;
    }

    let decision = decideNotificationDelivery({ capability, dedupeStore, event, now });

    if (decision.shouldMarkDelivered && decision.dedupeKey && claimMultiTabNotificationEvent(decision.dedupeKey, now)) {
      decision = {
        channel: 'suppressed',
        dedupeKey: decision.dedupeKey,
        degradedReason: null,
        reason: 'duplicate-event',
        shouldMarkDelivered: false,
      };
    }

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
      reminderHistory: persistNextReminderHistory(
        upsertReminderHistoryItem(state.reminderHistory, createReminderHistoryItem(attempt)),
      ),
    }));

    return decision;
  },
  replaceReminderHistory: (items) => {
    persistReminderHistory(items);
    set({ reminderHistory: items });
  },
  resetNotificationsStore: () => {
    dedupeStore.reset();
    clearReminderHistoryStorage();
    clearMultiTabNotificationClaims();
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
        reminderHistory: suppressionAttempt
          ? persistNextReminderHistory(
            upsertReminderHistoryItem(state.reminderHistory, createReminderHistoryItem(suppressionAttempt)),
          )
          : state.reminderHistory,
      };
    });
  },
}));

export function resetNotificationsStore() {
  useNotificationsStore.getState().resetNotificationsStore();
}