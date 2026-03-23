import assert from 'node:assert/strict';
import test from 'node:test';

import { BadRequestException, BadGatewayException, NotFoundException } from '@nestjs/common';

import { CreateCalendarEventUseCase } from '@/modules/events/use-cases/create-calendar-event.use-case';

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
    upsertEvent: async () => ({ id: 'calendar-1:event-1' }),
    ...overrides?.eventsRepository,
  };
  const eventsRemoteWriterService = {
    createEvent: async () => ({ end: { dateTime: '2026-03-22T10:00:00.000Z' }, id: 'event-1', start: { dateTime: '2026-03-22T09:00:00.000Z' }, summary: 'Daily operacional' }),
    rollbackCreatedEvent: async () => undefined,
    ...overrides?.eventsRemoteWriterService,
  };

  return new CreateCalendarEventUseCase(accountsRepository as never, eventsRepository as never, eventsRemoteWriterService as never);
}

test('create event rejects calendars outside the authenticated user scope or excluded by toggle', async () => {
  const missingCalendarUseCase = createUseCase();

  await assert.rejects(
    () => missingCalendarUseCase.execute('user-1', {
      calendarId: 'calendar-1',
      endAt: '2026-03-22T10:00:00.000Z',
      startAt: '2026-03-22T09:00:00.000Z',
      title: 'Daily operacional',
    }),
    NotFoundException,
  );

  const excludedCalendarUseCase = createUseCase({
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
        calendarIsIncluded: false,
        calendarName: 'Primary',
      }),
    },
  });

  await assert.rejects(
    () => excludedCalendarUseCase.execute('user-1', {
      calendarId: 'calendar-1',
      endAt: '2026-03-22T10:00:00.000Z',
      startAt: '2026-03-22T09:00:00.000Z',
      title: 'Daily operacional',
    }),
    BadRequestException,
  );
});

test('create event keeps local snapshot untouched when the remote Google write fails', async () => {
  let upsertCalls = 0;
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
      upsertEvent: async () => {
        upsertCalls += 1;
      },
    },
    eventsRemoteWriterService: {
      createEvent: async () => {
        throw new BadGatewayException('Google Calendar write failed with status 500.');
      },
    },
  });

  await assert.rejects(
    () => useCase.execute('user-1', {
      calendarId: 'calendar-1',
      endAt: '2026-03-22T10:00:00.000Z',
      startAt: '2026-03-22T09:00:00.000Z',
      title: 'Daily operacional',
    }),
    BadGatewayException,
  );

  assert.equal(upsertCalls, 0);
});