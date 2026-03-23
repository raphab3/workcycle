import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import {
  getBrowserNotificationCapabilitySnapshot,
  getServerNotificationCapabilitySnapshot,
  subscribeToBrowserNotificationCapability,
} from './browserNotificationCapability';

function setDocumentVisibilityState(value: DocumentVisibilityState) {
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    value,
  });
}

describe('browserNotificationCapability', () => {
  const originalNotification = globalThis.Notification;
  const originalHasFocus = document.hasFocus;

  beforeEach(() => {
    vi.restoreAllMocks();
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

  it('returns unsupported capability when Notification API is unavailable', () => {
    Object.defineProperty(globalThis, 'Notification', {
      configurable: true,
      value: undefined,
    });

    expect(getBrowserNotificationCapabilitySnapshot(true)).toEqual({
      permission: 'unsupported',
      productEnabled: true,
      supportsBrowserNotification: false,
      visibilityState: 'visible',
      windowFocused: true,
    });
  });

  it('returns current browser capability when Notification API is available', () => {
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

    expect(getBrowserNotificationCapabilitySnapshot(false)).toEqual({
      permission: 'granted',
      productEnabled: false,
      supportsBrowserNotification: true,
      visibilityState: 'hidden',
      windowFocused: false,
    });
  });

  it('provides a safe server snapshot', () => {
    expect(getServerNotificationCapabilitySnapshot(true)).toEqual({
      permission: 'unsupported',
      productEnabled: true,
      supportsBrowserNotification: false,
      visibilityState: 'hidden',
      windowFocused: false,
    });
  });

  it('subscribes to browser capability events and cleans up listeners', () => {
    const onStoreChange = vi.fn();
    const unsubscribe = subscribeToBrowserNotificationCapability(onStoreChange);

    window.dispatchEvent(new Event('focus'));
    window.dispatchEvent(new Event('blur'));
    document.dispatchEvent(new Event('visibilitychange'));

    expect(onStoreChange).toHaveBeenCalledTimes(3);

    unsubscribe();
    window.dispatchEvent(new Event('focus'));

    expect(onStoreChange).toHaveBeenCalledTimes(3);
  });
});