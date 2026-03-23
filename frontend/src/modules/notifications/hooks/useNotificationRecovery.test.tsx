import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useNotificationRecovery } from './useNotificationRecovery';

import { resetNotificationsStore, useNotificationsStore } from '@/modules/notifications';
import { resetWorkspaceStore, useWorkspaceStore } from '@/shared/store/useWorkspaceStore';

const capabilityState = {
  permission: 'granted' as const,
  productEnabled: true,
  supportsBrowserNotification: true,
  visibilityState: 'visible' as DocumentVisibilityState,
  windowFocused: true,
};

vi.mock('@/modules/notifications/hooks/useNotificationCapability', () => ({
  useNotificationCapability: () => capabilityState,
}));

describe('useNotificationRecovery', () => {
  beforeEach(() => {
    resetWorkspaceStore();
    resetNotificationsStore();
    capabilityState.permission = 'granted';
    capabilityState.productEnabled = true;
    capabilityState.supportsBrowserNotification = true;
    capabilityState.visibilityState = 'visible';
    capabilityState.windowFocused = true;
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-22T09:40:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows a single recovery reminder for a pending paused_inactivity pulse when the app becomes active again', () => {
    capabilityState.visibilityState = 'hidden';
    capabilityState.windowFocused = false;

    useWorkspaceStore.setState({
      cycleDate: '2026-03-22',
      sessionState: 'paused_inactivity',
    });
    useNotificationsStore.getState().syncPulseInactivityState({
      activeExpiredEventId: 'today-pulse:2026-03-22T09:30:00.000Z:expired',
      suppressFurtherPulseAlerts: true,
      suppressedSince: '2026-03-22T09:30:00.000Z',
    }, '2026-03-22T09:35:00.000Z');

    const { rerender } = renderHook(() => useNotificationRecovery());

    expect(useNotificationsStore.getState().activeInAppNotification).toBeNull();

    capabilityState.visibilityState = 'visible';
    capabilityState.windowFocused = true;

    rerender();

    expect(useNotificationsStore.getState().activeInAppNotification).toMatchObject({
      eventId: 'today-pulse:2026-03-22T09:30:00.000Z:expired',
      type: 'recovery-pending',
    });
  });

  it('shows the daily review recovery when there is no pulse recovery pending', () => {
    useWorkspaceStore.setState({
      closeDayReview: {
        message: 'Ainda existem minutos nao confirmados no ciclo atual.',
        requiresConfirmation: true,
        unconfirmedMinutes: 30,
      },
      cycleDate: '2026-03-22',
      sessionState: 'running',
    });

    renderHook(() => useNotificationRecovery());

    expect(useNotificationsStore.getState().activeInAppNotification).toMatchObject({
      eventId: 'daily-review:2026-03-22',
      type: 'recovery-pending',
    });
  });

  it('does not recreate a stale recovery after the operational day changes', () => {
    vi.setSystemTime(new Date('2026-03-23T08:00:00.000Z'));
    useWorkspaceStore.setState({
      cycleDate: '2026-03-22',
      sessionState: 'paused_inactivity',
    });
    useNotificationsStore.getState().syncPulseInactivityState({
      activeExpiredEventId: 'today-pulse:2026-03-22T09:30:00.000Z:expired',
      suppressFurtherPulseAlerts: true,
      suppressedSince: '2026-03-22T09:30:00.000Z',
    }, '2026-03-22T09:35:00.000Z');

    renderHook(() => useNotificationRecovery());

    expect(useNotificationsStore.getState().activeInAppNotification).toBeNull();
    expect(useNotificationsStore.getState().lastDeliveryDecision).toBeNull();
  });
});