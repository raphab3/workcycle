import assert from 'node:assert/strict';
import test from 'node:test';

import { EventsSyncService } from '@/modules/events/services/events-sync.service';
import { env } from '@/shared/config';

function createService(overrides?: {
  accountsRepository?: Partial<Record<string, unknown>>;
  eventsRepository?: Partial<Record<string, unknown>>;
}) {
  const accountsRepository = {
    listOperationalCalendarSources: async () => [],
    touchCalendarSync: async () => undefined,
    updateGoogleAccountTokens: async () => undefined,
    ...overrides?.accountsRepository,
  };
  const eventsRepository = {
    deleteMissingCalendarEvents: async () => undefined,
    upsertEvent: async () => undefined,
    ...overrides?.eventsRepository,
  };

  return {
    accountsRepository,
    eventsRepository,
    service: new EventsSyncService(accountsRepository as never, eventsRepository as never),
  };
}

function createFetchResponse(input: { json: unknown; ok: boolean; status?: number }) {
  return {
    json: async () => input.json,
    ok: input.ok,
    status: input.status ?? (input.ok ? 200 : 500),
  } as Response;
}

test('refreshEvents upserts remote events, reconciles missing local rows and degrades only failing sources', async () => {
  const upsertedEvents: Array<{ id: string; title: string }> = [];
  const deletedSnapshots: Array<{ calendarId: string; persistedIds: string[] }> = [];
  const touchedCalendars: string[] = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async (input: URL | string | Request) => {
    const url = String(input);

    if (url.includes('/calendars/calendar-1/events')) {
      return createFetchResponse({
        json: {
          items: [
            {
              attendees: [{ email: 'rafa@work.dev', responseStatus: 'accepted', self: true }],
              end: { dateTime: '2026-03-22T10:00:00.000Z' },
              hangoutLink: 'https://meet.google.com/abc-defg-hij',
              id: 'event-1',
              start: { dateTime: '2026-03-22T09:00:00.000Z' },
              summary: 'Daily operacional',
            },
          ],
        },
        ok: true,
      });
    }

    if (url.includes('/calendars/calendar-2/events')) {
      return createFetchResponse({ json: { error: 'boom' }, ok: false, status: 500 });
    }

    throw new Error(`Unexpected fetch call: ${url}`);
  }) as typeof fetch;

  try {
    const { service } = createService({
      accountsRepository: {
        listOperationalCalendarSources: async () => [
          {
            accountAccessToken: 'token-1',
            accountId: 'account-1',
            accountIsActive: true,
            accountRefreshToken: 'refresh-1',
            accountTokenExpiresAt: new Date('2099-03-22T08:00:00.000Z'),
            calendarId: 'calendar-1',
          },
          {
            accountAccessToken: 'token-2',
            accountId: 'account-2',
            accountIsActive: true,
            accountRefreshToken: 'refresh-2',
            accountTokenExpiresAt: new Date('2099-03-22T08:00:00.000Z'),
            calendarId: 'calendar-2',
          },
        ],
        touchCalendarSync: async (calendarId: string) => {
          touchedCalendars.push(calendarId);
        },
      },
      eventsRepository: {
        deleteMissingCalendarEvents: async (calendarId: string, _from: Date, _to: Date, persistedIds: string[]) => {
          deletedSnapshots.push({ calendarId, persistedIds });
        },
        upsertEvent: async (event: { id: string; title: string }) => {
          upsertedEvents.push(event);
        },
      },
    });

    const degradedSources = await service.refreshEvents('user-1', {
      from: '2026-03-22T00:00:00.000Z',
      refresh: true,
      to: '2026-03-23T00:00:00.000Z',
    });

    assert.equal(upsertedEvents.length, 1);
    assert.equal(upsertedEvents[0]?.id, 'calendar-1:event-1');
    assert.equal(upsertedEvents[0]?.title, 'Daily operacional');
    assert.deepEqual(deletedSnapshots, [{ calendarId: 'calendar-1', persistedIds: ['calendar-1:event-1'] }]);
    assert.deepEqual(touchedCalendars, ['calendar-1']);
    assert.deepEqual(degradedSources, [
      {
        accountId: 'account-2',
        calendarId: 'calendar-2',
        reason: 'Google Calendar fetch failed with status 500.',
      },
    ]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('refreshEvents refreshes an expired Google token and retries the calendar fetch once', async () => {
  const refreshedTokens: Array<{ accessToken: string; refreshToken: string }> = [];
  const originalFetch = globalThis.fetch;
  const originalClientId = env.GOOGLE_CLIENT_ID;
  const originalClientSecret = env.GOOGLE_CLIENT_SECRET;

  env.GOOGLE_CLIENT_ID = 'client-id';
  env.GOOGLE_CLIENT_SECRET = 'client-secret';

  let step = 0;
  globalThis.fetch = (async (input: URL | string | Request) => {
    const url = String(input);
    step += 1;

    if (step === 1 && url.includes('/token')) {
      return createFetchResponse({
        json: {
          access_token: 'fresh-token',
          expires_in: 3600,
        },
        ok: true,
      });
    }

    if (step === 2 && url.includes('/calendars/calendar-1/events')) {
      return createFetchResponse({ json: { items: [] }, ok: true });
    }

    throw new Error(`Unexpected fetch call: ${url}`);
  }) as typeof fetch;

  try {
    const { service } = createService({
      accountsRepository: {
        listOperationalCalendarSources: async () => [
          {
            accountAccessToken: 'stale-token',
            accountId: 'account-1',
            accountIsActive: true,
            accountRefreshToken: 'refresh-1',
            accountTokenExpiresAt: new Date('2026-03-22T00:00:00.000Z'),
            calendarId: 'calendar-1',
          },
        ],
        touchCalendarSync: async () => undefined,
        updateGoogleAccountTokens: async (_accountId: string, input: { accessToken: string; refreshToken: string }) => {
          refreshedTokens.push(input);
        },
      },
    });

    const degradedSources = await service.refreshEvents('user-1', {
      from: '2026-03-22T00:00:00.000Z',
      refresh: true,
      to: '2026-03-23T00:00:00.000Z',
    });

    assert.equal(refreshedTokens.length, 1);
    assert.equal(refreshedTokens[0]?.accessToken, 'fresh-token');
    assert.equal(refreshedTokens[0]?.refreshToken, 'refresh-1');
    assert.ok(refreshedTokens[0]?.tokenExpiresAt instanceof Date);
    assert.deepEqual(degradedSources, []);
  } finally {
    env.GOOGLE_CLIENT_ID = originalClientId;
    env.GOOGLE_CLIENT_SECRET = originalClientSecret;
    globalThis.fetch = originalFetch;
  }
});