import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, act } from '@testing-library/react';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';

import { resetNotificationsStore, useNotificationsStore } from '@/modules/notifications';
import { resetWorkspaceStore, useWorkspaceStore } from '@/shared/store/useWorkspaceStore';

import { useActivityPulse } from './useActivityPulse';

vi.mock('@/modules/notifications', async () => {
  const actual = await vi.importActual<typeof import('@/modules/notifications')>('@/modules/notifications');

  return {
    ...actual,
    useNotificationCapability: () => ({
      permission: 'granted',
      productEnabled: true,
      supportsBrowserNotification: true,
      visibilityState: 'visible',
      windowFocused: true,
    }),
  };
});

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useActivityPulse', () => {
  beforeEach(() => {
    resetWorkspaceStore();
    resetNotificationsStore();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-22T09:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('fires a pulse 30 minutes after a running session starts', () => {
    renderHook(() => useActivityPulse(), { wrapper: createWrapper() });

    act(() => {
      useWorkspaceStore.getState().startSession('proj-1');
    });

    act(() => {
      vi.advanceTimersByTime(30 * 60 * 1000);
    });

    const state = useWorkspaceStore.getState();

    expect(state.activePulse).not.toBeNull();
    expect(state.pulseHistory).toHaveLength(0);
    expect(useNotificationsStore.getState().lastDeliveryDecision?.channel).toBe('in-app');
    expect(useNotificationsStore.getState().activeInAppNotification?.eventId).toBe('today-pulse:2026-03-22T09:30:00.000Z:due');
  });

  it('pauses the session after 5 minutes without pulse confirmation', () => {
    renderHook(() => useActivityPulse(), { wrapper: createWrapper() });

    act(() => {
      useWorkspaceStore.getState().startSession('proj-1');
    });

    act(() => {
      vi.advanceTimersByTime(30 * 60 * 1000);
    });

    act(() => {
      vi.advanceTimersByTime(5 * 60 * 1000);
    });

    const state = useWorkspaceStore.getState();

    expect(state.sessionState).toBe('paused_inactivity');
    expect(state.pulseHistory).toHaveLength(1);
    expect(state.pulseHistory[0]).toMatchObject({
      status: 'unconfirmed',
      resolution: 'pending',
    });
    expect(useNotificationsStore.getState().deliveryAttempts.at(-1)?.eventId).toBe('today-pulse:2026-03-22T09:30:00.000Z:expired');
  });

  it('does not fire additional pulses while the session is paused', () => {
    renderHook(() => useActivityPulse(), { wrapper: createWrapper() });

    act(() => {
      useWorkspaceStore.getState().startSession('proj-1');
    });

    act(() => {
      vi.advanceTimersByTime(30 * 60 * 1000);
    });

    act(() => {
      vi.advanceTimersByTime(5 * 60 * 1000);
    });

    act(() => {
      vi.advanceTimersByTime(60 * 60 * 1000);
    });

    expect(useWorkspaceStore.getState().pulseHistory).toHaveLength(1);
  });

  it('resets the 30-minute timer after confirming a pulse', () => {
    renderHook(() => useActivityPulse(), { wrapper: createWrapper() });

    act(() => {
      useWorkspaceStore.getState().startSession('proj-1');
    });

    act(() => {
      vi.advanceTimersByTime(30 * 60 * 1000);
    });

    act(() => {
      useWorkspaceStore.getState().confirmActivePulse();
    });

    act(() => {
      vi.advanceTimersByTime(29 * 60 * 1000);
    });

    expect(useWorkspaceStore.getState().activePulse).toBeNull();

    act(() => {
      vi.advanceTimersByTime(60 * 1000);
    });

    expect(useWorkspaceStore.getState().activePulse).not.toBeNull();
    expect(useWorkspaceStore.getState().pulseHistory).toHaveLength(1);
    expect(useWorkspaceStore.getState().pulseHistory[0].status).toBe('confirmed');
  });

  it('dismisses the pending notification when the active pulse is confirmed', () => {
    renderHook(() => useActivityPulse(), { wrapper: createWrapper() });

    act(() => {
      useWorkspaceStore.getState().startSession('proj-1');
    });

    act(() => {
      vi.advanceTimersByTime(30 * 60 * 1000);
    });

    expect(useNotificationsStore.getState().activeInAppNotification?.eventId).toBe('today-pulse:2026-03-22T09:30:00.000Z:due');

    act(() => {
      useWorkspaceStore.getState().confirmActivePulse('2026-03-22T09:31:00.000Z');
    });

    expect(useNotificationsStore.getState().activeInAppNotification).toBeNull();
  });
});