import { renderHook, act } from '@testing-library/react';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';

import { resetWorkspaceStore, useWorkspaceStore } from '@/shared/store/useWorkspaceStore';

import { useActivityPulse } from './useActivityPulse';

describe('useActivityPulse', () => {
  beforeEach(() => {
    resetWorkspaceStore();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-22T09:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('fires a pulse 30 minutes after a running session starts', () => {
    renderHook(() => useActivityPulse());

    act(() => {
      useWorkspaceStore.getState().startSession('proj-1');
    });

    act(() => {
      vi.advanceTimersByTime(30 * 60 * 1000);
    });

    const state = useWorkspaceStore.getState();

    expect(state.activePulse).not.toBeNull();
    expect(state.pulseHistory).toHaveLength(0);
  });

  it('pauses the session after 5 minutes without pulse confirmation', () => {
    renderHook(() => useActivityPulse());

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
  });

  it('does not fire additional pulses while the session is paused', () => {
    renderHook(() => useActivityPulse());

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
    renderHook(() => useActivityPulse());

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
});