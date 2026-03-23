import { beforeEach, describe, expect, it } from 'vitest';

import {
  clearReminderHistoryStorage,
  persistReminderHistory,
  readReminderHistory,
  REMINDER_HISTORY_STORAGE_KEY,
} from './reminderHistoryStorage';

describe('reminderHistoryStorage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('persists and reads recent reminder history items', () => {
    persistReminderHistory([
      {
        contextLabel: 'Pulso de atividade',
        eventId: 'event-1',
        occurredAt: '2026-03-22T10:00:00.000Z',
        status: 'shown',
        type: 'activity-pulse-due',
      },
    ]);

    expect(readReminderHistory()).toEqual([
      {
        contextLabel: 'Pulso de atividade',
        eventId: 'event-1',
        occurredAt: '2026-03-22T10:00:00.000Z',
        status: 'shown',
        type: 'activity-pulse-due',
      },
    ]);
  });

  it('fails safely when the stored JSON is corrupted', () => {
    window.localStorage.setItem(REMINDER_HISTORY_STORAGE_KEY, '{invalid-json');

    expect(readReminderHistory()).toEqual([]);
    expect(window.localStorage.getItem(REMINDER_HISTORY_STORAGE_KEY)).toBeNull();
  });

  it('clears stored reminder history explicitly', () => {
    persistReminderHistory([
      {
        contextLabel: 'Pulso de atividade',
        eventId: 'event-1',
        occurredAt: '2026-03-22T10:00:00.000Z',
        status: 'shown',
        type: 'activity-pulse-due',
      },
    ]);

    clearReminderHistoryStorage();

    expect(readReminderHistory()).toEqual([]);
  });
});