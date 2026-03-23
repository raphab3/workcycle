import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useNotificationCapability } from './useNotificationCapability';

const useUserSettingsQueryMock = vi.fn();

vi.mock('@/modules/settings', async () => {
  const actual = await vi.importActual<typeof import('@/modules/settings')>('@/modules/settings');

  return {
    ...actual,
    useUserSettingsQuery: (...args: unknown[]) => useUserSettingsQueryMock(...args),
  };
});

function setDocumentVisibilityState(value: DocumentVisibilityState) {
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    value,
  });
}

describe('useNotificationCapability', () => {
  const originalNotification = globalThis.Notification;
  const originalHasFocus = document.hasFocus;

  beforeEach(() => {
    useUserSettingsQueryMock.mockReset();
    useUserSettingsQueryMock.mockReturnValue({
      data: {
        cycleStartHour: '08:00',
        dailyReviewTime: '18:30',
        googleConnection: {
          connectedAccountCount: 0,
          hasGoogleLinked: false,
          linkedAt: null,
        },
        notificationsEnabled: true,
        timezone: 'America/Sao_Paulo',
      },
    });
    Object.defineProperty(globalThis, 'Notification', {
      configurable: true,
      value: {
        permission: 'default',
      },
    });
    setDocumentVisibilityState('visible');
    Object.defineProperty(document, 'hasFocus', {
      configurable: true,
      value: vi.fn(() => true),
    });
  });

  afterEach(() => {
    Object.defineProperty(globalThis, 'Notification', {
      configurable: true,
      value: originalNotification,
    });
    Object.defineProperty(document, 'hasFocus', {
      configurable: true,
      value: originalHasFocus,
    });
  });

  it('combines persisted product preference with current browser capability', () => {
    const { result } = renderHook(() => useNotificationCapability());

    expect(useUserSettingsQueryMock).toHaveBeenCalledWith({ enabled: true });
    expect(result.current).toEqual({
      permission: 'default',
      productEnabled: true,
      supportsBrowserNotification: true,
      visibilityState: 'visible',
      windowFocused: true,
    });
  });

  it('falls back to product disabled when settings are not loaded yet', () => {
    useUserSettingsQueryMock.mockReturnValue({ data: undefined });

    const { result } = renderHook(() => useNotificationCapability());

    expect(result.current.productEnabled).toBe(false);
  });

  it('updates when browser focus and visibility change', () => {
    const { result } = renderHook(() => useNotificationCapability());

    act(() => {
      Object.defineProperty(globalThis, 'Notification', {
        configurable: true,
        value: {
          permission: 'granted',
        },
      });
      setDocumentVisibilityState('hidden');
      Object.defineProperty(document, 'hasFocus', {
        configurable: true,
        value: vi.fn(() => false),
      });
      window.dispatchEvent(new Event('blur'));
      document.dispatchEvent(new Event('visibilitychange'));
    });

    expect(result.current).toEqual({
      permission: 'granted',
      productEnabled: true,
      supportsBrowserNotification: true,
      visibilityState: 'hidden',
      windowFocused: false,
    });
  });

  it('reports unsupported when Notification API is unavailable', () => {
    Object.defineProperty(globalThis, 'Notification', {
      configurable: true,
      value: undefined,
    });

    const { result } = renderHook(() => useNotificationCapability({ enabled: false }));

    expect(useUserSettingsQueryMock).toHaveBeenCalledWith({ enabled: false });
    expect(result.current.supportsBrowserNotification).toBe(false);
    expect(result.current.permission).toBe('unsupported');
  });
});