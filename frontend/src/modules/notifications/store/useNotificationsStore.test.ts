import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { resetNotificationsStore, useNotificationsStore } from './useNotificationsStore';

import { claimMultiTabNotificationEvent } from '@/modules/notifications/services/multiTabNotificationSync';
import { createPulseInactivityState } from '@/modules/notifications/services/pulseInactivityPolicy';
import { readReminderHistory } from '@/modules/notifications/services/reminderHistoryStorage';

import type { NotificationCapabilityState } from '@/modules/notifications/types/capability';

const baseCapability: NotificationCapabilityState = {
  permission: 'granted',
  productEnabled: true,
  supportsBrowserNotification: true,
  visibilityState: 'visible',
  windowFocused: true,
};

const baseEvent = {
  eventId: 'event-1',
  message: 'Confirme sua atividade operacional.',
  occurredAt: '2026-03-22T10:00:00.000Z',
  title: 'Pulso de atividade',
  type: 'activity-pulse-due' as const,
};

describe('useNotificationsStore', () => {
  const OriginalNotification = globalThis.Notification;

  beforeEach(() => {
    window.localStorage.clear();
    resetNotificationsStore();
  });

  afterEach(() => {
    Object.defineProperty(globalThis, 'Notification', {
      configurable: true,
      value: OriginalNotification,
    });
  });

  it('creates an in-app notification and records the delivery attempt when the page is visible', () => {
    const decision = useNotificationsStore.getState().dispatchEvent(baseEvent, baseCapability);
    const state = useNotificationsStore.getState();

    expect(decision.channel).toBe('in-app');
    expect(state.activeInAppNotification).toMatchObject({
      eventId: 'event-1',
      title: 'Pulso de atividade',
    });
    expect(state.deliveryAttempts).toHaveLength(1);
    expect(state.reminderHistory).toMatchObject([
      {
        eventId: 'event-1',
        status: 'shown',
        type: 'activity-pulse-due',
      },
    ]);
    expect(readReminderHistory()).toMatchObject([
      {
        eventId: 'event-1',
        status: 'shown',
        type: 'activity-pulse-due',
      },
    ]);
  });

  it('attempts browser delivery when capability supports background notifications', () => {
    class NotificationMock {
      static permission: NotificationPermission = 'granted';

      constructor(
        readonly title: string,
        readonly options?: NotificationOptions,
      ) {}
    }

    Object.defineProperty(globalThis, 'Notification', {
      configurable: true,
      value: NotificationMock,
    });

    const decision = useNotificationsStore.getState().dispatchEvent(baseEvent, {
      ...baseCapability,
      visibilityState: 'hidden',
      windowFocused: false,
    });

    expect(decision.channel).toBe('browser');
    expect(useNotificationsStore.getState().deliveryAttempts.at(-1)).toMatchObject({
      channel: 'browser',
      eventId: 'event-1',
    });
  });

  it('falls back to in-app and exposes degraded reason when browser delivery throws', () => {
    class NotificationMock {
      static permission: NotificationPermission = 'granted';

      constructor() {
        throw new Error('notification failed');
      }
    }

    Object.defineProperty(globalThis, 'Notification', {
      configurable: true,
      value: NotificationMock,
    });

    const decision = useNotificationsStore.getState().dispatchEvent(baseEvent, {
      ...baseCapability,
      visibilityState: 'hidden',
      windowFocused: false,
    });
    const state = useNotificationsStore.getState();

    expect(decision.channel).toBe('in-app');
    expect(decision.degradedReason).toBe('browser-delivery-failed');
    expect(state.activeInAppNotification?.eventId).toBe('event-1');
  });

  it('suppresses duplicate events already delivered in memory', () => {
    useNotificationsStore.getState().dispatchEvent(baseEvent, baseCapability, '2026-03-22T10:00:00.000Z');

    const decision = useNotificationsStore.getState().dispatchEvent(baseEvent, baseCapability, '2026-03-22T10:00:01.000Z');

    expect(decision.channel).toBe('suppressed');
    expect(decision.reason).toBe('duplicate-event');
  });

  it('suppresses an event already claimed by another tab', () => {
    claimMultiTabNotificationEvent('activity-pulse-due:event-1', '2026-03-22T10:00:00.000Z');

    const decision = useNotificationsStore.getState().dispatchEvent({
      ...baseEvent,
      eventId: 'event-1',
    }, {
      ...baseCapability,
      visibilityState: 'hidden',
      windowFocused: false,
    }, '2026-03-22T10:00:01.000Z');

    expect(decision.channel).toBe('suppressed');
    expect(decision.reason).toBe('duplicate-event');
  });

  it('dismisses only the in-app notification that matches the given event id', () => {
    useNotificationsStore.getState().dispatchEvent(baseEvent, baseCapability);

    useNotificationsStore.getState().dismissNotificationEvent('event-2');

    expect(useNotificationsStore.getState().activeInAppNotification?.eventId).toBe('event-1');

    useNotificationsStore.getState().dismissNotificationEvent('event-1');

    expect(useNotificationsStore.getState().activeInAppNotification).toBeNull();
  });

  it('records suppression state and suppresses new pulse alerts while paused_inactivity is active', () => {
    useNotificationsStore.getState().syncPulseInactivityState(createPulseInactivityState('paused_inactivity', {
      confirmedMinutes: 0,
      firedAt: '2026-03-22T09:30:00.000Z',
      projectId: 'proj-1',
      resolution: 'pending',
      respondedAt: null,
      reviewedAt: null,
      status: 'unconfirmed',
    }), '2026-03-22T09:35:00.000Z');

    const decision = useNotificationsStore.getState().dispatchEvent({
      ...baseEvent,
      eventId: 'event-2',
      occurredAt: '2026-03-22T10:00:00.000Z',
    }, baseCapability, '2026-03-22T10:00:00.000Z');

    expect(decision.channel).toBe('suppressed');
    expect(decision.reason).toBe('paused-inactivity-active');
    expect(useNotificationsStore.getState().deliveryAttempts.at(-2)).toMatchObject({
      channel: 'suppressed',
      eventId: 'today-pulse:2026-03-22T09:30:00.000Z:expired',
      reason: 'paused-inactivity-active',
    });
    expect(useNotificationsStore.getState().deliveryAttempts.at(-1)).toMatchObject({
      channel: 'suppressed',
      eventId: 'event-2',
      reason: 'paused-inactivity-active',
    });
  });

  it('clears suppression and stale action guard when inactivity state is reset', () => {
    useNotificationsStore.getState().syncPulseInactivityState(createPulseInactivityState('paused_inactivity', {
      confirmedMinutes: 0,
      firedAt: '2026-03-22T09:30:00.000Z',
      projectId: 'proj-1',
      resolution: 'pending',
      respondedAt: null,
      reviewedAt: null,
      status: 'unconfirmed',
    }), '2026-03-22T09:35:00.000Z');

    expect(useNotificationsStore.getState().isNotificationEventActionable('today-pulse:2026-03-22T09:30:00.000Z:due')).toBe(false);

    useNotificationsStore.getState().syncPulseInactivityState({
      activeExpiredEventId: null,
      suppressFurtherPulseAlerts: false,
      suppressedSince: null,
    }, '2026-03-22T09:40:00.000Z');

    expect(useNotificationsStore.getState().pulseInactivity).toEqual({
      activeExpiredEventId: null,
      suppressFurtherPulseAlerts: false,
      suppressedSince: null,
    });
    expect(useNotificationsStore.getState().isNotificationEventActionable('today-pulse:2026-03-22T09:30:00.000Z:due')).toBe(true);
  });

  it('hydrates reminder history from persisted storage after a reload-like reset', () => {
    useNotificationsStore.getState().dispatchEvent(baseEvent, baseCapability, '2026-03-22T10:00:00.000Z');

    useNotificationsStore.setState({ reminderHistory: [] });
    useNotificationsStore.getState().hydrateReminderHistory();

    expect(useNotificationsStore.getState().reminderHistory).toMatchObject([
      {
        eventId: 'event-1',
        status: 'shown',
        type: 'activity-pulse-due',
      },
    ]);
  });
});