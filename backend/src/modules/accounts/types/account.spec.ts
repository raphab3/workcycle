import assert from 'node:assert/strict';
import test from 'node:test';

import { toGoogleAccountConnections } from '@/modules/accounts/types/account';

test('toGoogleAccountConnections groups calendars by account while preserving accounts without calendars', () => {
  const result = toGoogleAccountConnections([
    {
      accountDisplayName: 'Rafa Work',
      accountEmail: 'rafa@work.dev',
      accountId: 'account-1',
      accountIsActive: true,
      accountTokenExpiresAt: new Date('2026-03-22T12:00:00.000Z'),
      accountUpdatedAt: new Date('2026-03-22T10:00:00.000Z'),
      calendarAccountId: 'account-1',
      calendarColorHex: '#3367D6',
      calendarId: 'calendar-1',
      calendarIsIncluded: true,
      calendarIsPrimary: true,
      calendarName: 'Primary',
      calendarSyncedAt: new Date('2026-03-22T09:00:00.000Z'),
    },
    {
      accountDisplayName: 'Rafa Work',
      accountEmail: 'rafa@work.dev',
      accountId: 'account-1',
      accountIsActive: true,
      accountTokenExpiresAt: new Date('2026-03-22T12:00:00.000Z'),
      accountUpdatedAt: new Date('2026-03-22T10:00:00.000Z'),
      calendarAccountId: 'account-1',
      calendarColorHex: '#0B8043',
      calendarId: 'calendar-2',
      calendarIsIncluded: false,
      calendarIsPrimary: false,
      calendarName: 'Cliente A',
      calendarSyncedAt: null,
    },
    {
      accountDisplayName: 'Rafa Personal',
      accountEmail: 'rafa@home.dev',
      accountId: 'account-2',
      accountIsActive: false,
      accountTokenExpiresAt: new Date('2026-03-21T12:00:00.000Z'),
      accountUpdatedAt: new Date('2026-03-22T08:00:00.000Z'),
      calendarAccountId: null,
      calendarColorHex: null,
      calendarId: null,
      calendarIsIncluded: null,
      calendarIsPrimary: null,
      calendarName: null,
      calendarSyncedAt: null,
    },
  ]);

  assert.deepEqual(result, [
    {
      calendars: [
        {
          accountId: 'account-1',
          colorHex: '#3367D6',
          id: 'calendar-1',
          isIncluded: true,
          isPrimary: true,
          name: 'Primary',
          syncedAt: '2026-03-22T09:00:00.000Z',
        },
        {
          accountId: 'account-1',
          colorHex: '#0B8043',
          id: 'calendar-2',
          isIncluded: false,
          isPrimary: false,
          name: 'Cliente A',
          syncedAt: null,
        },
      ],
      displayName: 'Rafa Work',
      email: 'rafa@work.dev',
      id: 'account-1',
      isActive: true,
      tokenExpiresAt: '2026-03-22T12:00:00.000Z',
      updatedAt: '2026-03-22T10:00:00.000Z',
    },
    {
      calendars: [],
      displayName: 'Rafa Personal',
      email: 'rafa@home.dev',
      id: 'account-2',
      isActive: false,
      tokenExpiresAt: '2026-03-21T12:00:00.000Z',
      updatedAt: '2026-03-22T08:00:00.000Z',
    },
  ]);
});