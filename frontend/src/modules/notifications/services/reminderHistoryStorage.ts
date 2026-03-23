import type { ReminderHistoryItem } from '@/modules/notifications/types/history';

export const REMINDER_HISTORY_STORAGE_KEY = 'workcycle-reminder-history';
const MAX_REMINDER_HISTORY_ITEMS = 20;

function isReminderHistoryItem(value: unknown): value is ReminderHistoryItem {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const item = value as Record<string, unknown>;

  return typeof item.eventId === 'string'
    && typeof item.occurredAt === 'string'
    && typeof item.type === 'string'
    && typeof item.status === 'string'
    && (typeof item.contextLabel === 'string' || item.contextLabel === null);
}

function normalizeReminderHistory(rawValue: unknown): ReminderHistoryItem[] | null {
  if (!Array.isArray(rawValue)) {
    return null;
  }

  const items = rawValue.filter(isReminderHistoryItem);

  if (items.length !== rawValue.length) {
    return null;
  }

  return items.slice(0, MAX_REMINDER_HISTORY_ITEMS);
}

export function readReminderHistory() {
  if (typeof window === 'undefined') {
    return [] as ReminderHistoryItem[];
  }

  const rawValue = window.localStorage.getItem(REMINDER_HISTORY_STORAGE_KEY);

  if (!rawValue) {
    return [] as ReminderHistoryItem[];
  }

  try {
    const items = normalizeReminderHistory(JSON.parse(rawValue));

    if (!items) {
      window.localStorage.removeItem(REMINDER_HISTORY_STORAGE_KEY);
      return [] as ReminderHistoryItem[];
    }

    window.localStorage.setItem(REMINDER_HISTORY_STORAGE_KEY, JSON.stringify(items));

    return items;
  } catch {
    window.localStorage.removeItem(REMINDER_HISTORY_STORAGE_KEY);
    return [] as ReminderHistoryItem[];
  }
}

export function persistReminderHistory(items: ReminderHistoryItem[]) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(
    REMINDER_HISTORY_STORAGE_KEY,
    JSON.stringify(items.slice(0, MAX_REMINDER_HISTORY_ITEMS)),
  );
}

export function clearReminderHistoryStorage() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(REMINDER_HISTORY_STORAGE_KEY);
}