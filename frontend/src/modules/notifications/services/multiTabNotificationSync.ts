import { readReminderHistory, REMINDER_HISTORY_STORAGE_KEY } from '@/modules/notifications/services/reminderHistoryStorage';

import type { ReminderHistoryItem } from '@/modules/notifications/types/history';

const NOTIFICATION_CLAIMS_STORAGE_KEY = 'workcycle-notification-claims';
const DEFAULT_CLAIM_TTL_MS = 10_000;

type NotificationClaimsMap = Record<string, string>;

function readNotificationClaims(): NotificationClaimsMap {
  if (typeof window === 'undefined') {
    return {};
  }

  const rawValue = window.localStorage.getItem(NOTIFICATION_CLAIMS_STORAGE_KEY);

  if (!rawValue) {
    return {};
  }

  try {
    const parsed = JSON.parse(rawValue);

    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      window.localStorage.removeItem(NOTIFICATION_CLAIMS_STORAGE_KEY);
      return {};
    }

    return Object.fromEntries(
      Object.entries(parsed).filter((entry): entry is [string, string] => typeof entry[0] === 'string' && typeof entry[1] === 'string'),
    );
  } catch {
    window.localStorage.removeItem(NOTIFICATION_CLAIMS_STORAGE_KEY);
    return {};
  }
}

function persistNotificationClaims(claims: NotificationClaimsMap) {
  if (typeof window === 'undefined') {
    return;
  }

  if (Object.keys(claims).length === 0) {
    window.localStorage.removeItem(NOTIFICATION_CLAIMS_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(NOTIFICATION_CLAIMS_STORAGE_KEY, JSON.stringify(claims));
}

function pruneNotificationClaims(claims: NotificationClaimsMap, nowMs: number, ttlMs: number) {
  return Object.fromEntries(
    Object.entries(claims).filter(([, claimedAt]) => {
      const claimedAtMs = Date.parse(claimedAt);

      return Number.isFinite(claimedAtMs) && claimedAtMs + ttlMs > nowMs;
    }),
  );
}

export function claimMultiTabNotificationEvent(dedupeKey: string, now = new Date().toISOString(), ttlMs = DEFAULT_CLAIM_TTL_MS) {
  if (typeof window === 'undefined') {
    return false;
  }

  const nowMs = Date.parse(now);
  const claims = pruneNotificationClaims(readNotificationClaims(), nowMs, ttlMs);

  if (claims[dedupeKey]) {
    persistNotificationClaims(claims);
    return true;
  }

  claims[dedupeKey] = now;
  persistNotificationClaims(claims);

  return false;
}

export function clearMultiTabNotificationClaims() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(NOTIFICATION_CLAIMS_STORAGE_KEY);
}

export function subscribeToReminderHistorySync(onHistoryChange: (items: ReminderHistoryItem[]) => void) {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key !== REMINDER_HISTORY_STORAGE_KEY) {
      return;
    }

    onHistoryChange(readReminderHistory());
  };

  window.addEventListener('storage', handleStorage);

  return () => {
    window.removeEventListener('storage', handleStorage);
  };
}