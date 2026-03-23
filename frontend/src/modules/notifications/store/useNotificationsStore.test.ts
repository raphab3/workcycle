import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { resetNotificationsStore, useNotificationsStore } from './useNotificationsStore';

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

  it('dismisses only the in-app notification that matches the given event id', () => {
    useNotificationsStore.getState().dispatchEvent(baseEvent, baseCapability);

    useNotificationsStore.getState().dismissNotificationEvent('event-2');

    expect(useNotificationsStore.getState().activeInAppNotification?.eventId).toBe('event-1');

    useNotificationsStore.getState().dismissNotificationEvent('event-1');

    expect(useNotificationsStore.getState().activeInAppNotification).toBeNull();
  });
});