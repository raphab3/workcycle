import assert from 'node:assert/strict';
import test from 'node:test';

import { NotFoundException } from '@nestjs/common';

import { DeleteCalendarEventUseCase } from '@/modules/events/use-cases/delete-calendar-event.use-case';

function createUseCase(overrides?: {
  accountsRepository?: Partial<Record<string, unknown>>;
  eventsRepository?: Partial<Record<string, unknown>>;
  eventsRemoteWriterService?: Partial<Record<string, unknown>>;
}) {
  const accountsRepository = {
    findCalendarSource: async () => undefined,
    ...overrides?.accountsRepository,
  };
  const eventsRepository = {
    deleteEvent: async () => undefined,
    findEventById: async () => undefined,
    ...overrides?.eventsRepository,
  };
  const eventsRemoteWriterService = {
    deleteEvent: async () => ({ deleted: true }),
    ...overrides?.eventsRemoteWriterService,
  };

  return new DeleteCalendarEventUseCase(accountsRepository as never, eventsRepository as never, eventsRemoteWriterService as never);
}

test('delete event removes the local snapshot after remote confirmation', async () => {
  const deletedIds: string[] = [];
  const useCase = createUseCase({
    accountsRepository: {
      findCalendarSource: async () => ({
        accountAccessToken: 'token',
        accountDisplayName: 'Rafa Work',
        accountEmail: 'rafa@work.dev',
        accountId: 'account-1',
        accountIsActive: true,
        accountRefreshToken: 'refresh',
        accountTokenExpiresAt: new Date('2099-03-22T08:00:00.000Z'),
        calendarColorHex: '#3367D6',
        calendarId: 'calendar-1',
        calendarIsIncluded: true,
        calendarName: 'Primary',
      }),
    },
    eventsRepository: {
      deleteEvent: async (id: string) => {
        deletedIds.push(id);
      },
      findEventById: async () => ({
        calendarId: 'calendar-1',
        id: 'calendar-1:event-1',
      }),
    },
  });

  const result = await useCase.execute('calendar-1:event-1', 'user-1');

  assert.deepEqual(deletedIds, ['calendar-1:event-1']);
  assert.deepEqual(result, { deleted: true, id: 'calendar-1:event-1' });
});

test('delete event rejects missing local ownership before any remote mutation', async () => {
  const useCase = createUseCase();

  await assert.rejects(() => useCase.execute('calendar-1:event-1', 'user-1'), NotFoundException);
});