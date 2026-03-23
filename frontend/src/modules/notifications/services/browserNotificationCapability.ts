import type { NotificationCapabilityState } from '@/modules/notifications/types/capability';

let lastBrowserSnapshot: NotificationCapabilityState | null = null;
let lastBrowserSnapshotKey: string | null = null;
let lastServerSnapshot: NotificationCapabilityState | null = null;
let lastServerSnapshotKey: string | null = null;

function buildSnapshotKey(snapshot: NotificationCapabilityState) {
  return [
    snapshot.permission,
    snapshot.productEnabled ? '1' : '0',
    snapshot.supportsBrowserNotification ? '1' : '0',
    snapshot.visibilityState,
    snapshot.windowFocused ? '1' : '0',
  ].join(':');
}

function getCachedBrowserSnapshot(snapshot: NotificationCapabilityState) {
  const nextKey = buildSnapshotKey(snapshot);

  if (lastBrowserSnapshotKey === nextKey && lastBrowserSnapshot) {
    return lastBrowserSnapshot;
  }

  lastBrowserSnapshotKey = nextKey;
  lastBrowserSnapshot = snapshot;

  return snapshot;
}

function getCachedServerSnapshot(snapshot: NotificationCapabilityState) {
  const nextKey = buildSnapshotKey(snapshot);

  if (lastServerSnapshotKey === nextKey && lastServerSnapshot) {
    return lastServerSnapshot;
  }

  lastServerSnapshotKey = nextKey;
  lastServerSnapshot = snapshot;

  return snapshot;
}

function resolveVisibilityState(): DocumentVisibilityState {
  if (typeof document === 'undefined') {
    return 'hidden';
  }

  return document.visibilityState;
}

function resolveWindowFocused() {
  if (typeof document === 'undefined' || typeof document.hasFocus !== 'function') {
    return false;
  }

  return document.hasFocus();
}

function resolveNotificationPermission(): NotificationCapabilityState['permission'] {
  if (typeof Notification === 'undefined') {
    return 'unsupported';
  }

  return Notification.permission;
}

export function getBrowserNotificationCapabilitySnapshot(productEnabled: boolean): NotificationCapabilityState {
  const permission = resolveNotificationPermission();

  return getCachedBrowserSnapshot({
    permission,
    productEnabled,
    supportsBrowserNotification: permission !== 'unsupported',
    visibilityState: resolveVisibilityState(),
    windowFocused: resolveWindowFocused(),
  });
}

export function getServerNotificationCapabilitySnapshot(productEnabled: boolean): NotificationCapabilityState {
  return getCachedServerSnapshot({
    permission: 'unsupported',
    productEnabled,
    supportsBrowserNotification: false,
    visibilityState: 'hidden',
    windowFocused: false,
  });
}

export function subscribeToBrowserNotificationCapability(onStoreChange: () => void) {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return () => undefined;
  }

  const notify = () => {
    onStoreChange();
  };

  window.addEventListener('focus', notify);
  window.addEventListener('blur', notify);
  document.addEventListener('visibilitychange', notify);

  return () => {
    window.removeEventListener('focus', notify);
    window.removeEventListener('blur', notify);
    document.removeEventListener('visibilitychange', notify);
  };
}