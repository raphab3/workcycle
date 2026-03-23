import assert from 'node:assert/strict';
import test from 'node:test';

import { ListCalendarEventsUseCase } from '@/modules/events/use-cases/list-calendar-events.use-case';

function createUseCase(overrides?: {
  eventsRepository?: Partial<Record<string, unknown>>;
  eventsSyncService?: Partial<Record<string, unknown>>;
}) {
  const eventsRepository = {
    listEventsByInterval: async () => [],
    ...overrides?.eventsRepository,
  };
  const eventsSyncService = {
    refreshEvents: async () => [],
    ...overrides?.eventsSyncService,
  };

  return new ListCalendarEventsUseCase(eventsRepository as never, eventsSyncService as never);
}

test('execute refreshes sources when requested and returns mapped event payloads plus degraded sources', async () => {
  let refreshCalls = 0;
  const useCase = createUseCase({
    eventsRepository: {
      listEventsByInterval: async () => [
        {
          accountDisplayName: 'Rafa Work',
          accountEmail: 'rafa@work.dev',
          accountId: 'account-1',
          attendees: [],
          calendarColorHex: '#3367D6',
          calendarId: 'calendar-1',
          calendarName: 'Primary',
          description: null,
          endAt: new Date('2026-03-22T10:00:00.000Z'),
          id: 'calendar-1:event-1',
          isAllDay: false,
          location: null,
          meetLink: null,
          projectId: null,
          recurrenceRule: null,
          recurringEventId: null,
          responseStatus: 'accepted',
          startAt: new Date('2026-03-22T09:00:00.000Z'),
          syncedAt: new Date('2026-03-22T08:30:00.000Z'),
          title: 'Daily operacional',
          updatedAt: new Date('2026-03-22T08:30:00.000Z'),
        },
      ],
    },
    eventsSyncService: {
      refreshEvents: async () => {
        refreshCalls += 1;

        return [{ accountId: 'account-2', calendarId: 'calendar-2', reason: 'Google Calendar fetch failed with status 500.' }];
      },
    },
  });

  const result = await useCase.execute('user-1', {
    from: '2026-03-22T00:00:00.000Z',
    refresh: true,
    to: '2026-03-23T00:00:00.000Z',
  });

  assert.equal(refreshCalls, 1);
  assert.deepEqual(result.degradedSources, [
    { accountId: 'account-2', calendarId: 'calendar-2', reason: 'Google Calendar fetch failed with status 500.' },
  ]);
  assert.equal(result.events[0]?.calendarName, 'Primary');
  assert.equal(result.events[0]?.startAt, '2026-03-22T09:00:00.000Z');
});