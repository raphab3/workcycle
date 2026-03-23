import assert from 'node:assert/strict';
import test from 'node:test';

import { BadRequestException, NotFoundException } from '@nestjs/common';

import { UpdateCalendarEventUseCase } from '@/modules/events/use-cases/update-calendar-event.use-case';

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
    findEventById: async () => undefined,
    upsertEvent: async () => ({ id: 'calendar-1:event-1' }),
    ...overrides?.eventsRepository,
  };
  const eventsRemoteWriterService = {
    updateEvent: async () => ({
      attendees: [{ email: 'rafa@work.dev', responseStatus: 'declined', self: true }],
      end: { dateTime: '2026-03-22T10:00:00.000Z' },
      id: 'event-1',
      start: { dateTime: '2026-03-22T09:00:00.000Z' },
      summary: 'Daily operacional',
    }),
    ...overrides?.eventsRemoteWriterService,
  };

  return new UpdateCalendarEventUseCase(accountsRepository as never, eventsRepository as never, eventsRemoteWriterService as never);
}

test('update event rejects missing ownership before any remote participation change', async () => {
  const useCase = createUseCase();

  await assert.rejects(() => useCase.execute('calendar-1:event-1', 'user-1', { responseStatus: 'declined' }), NotFoundException);
});

test('update event rejects attempts to move the event to another calendar', async () => {
  const useCase = createUseCase({
    eventsRepository: {
      findEventById: async () => ({
        accountDisplayName: 'Rafa Work',
        accountEmail: 'rafa@work.dev',
        accountId: 'account-1',
        attendees: [],
        calendarColorHex: '#3367D6',
        calendarId: 'calendar-1',
        calendarIsIncluded: true,
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
        syncedAt: new Date('2026-03-22T08:50:00.000Z'),
        title: 'Daily operacional',
        updatedAt: new Date('2026-03-22T08:50:00.000Z'),
      }),
    },
  });

  await assert.rejects(() => useCase.execute('calendar-1:event-1', 'user-1', { calendarId: 'calendar-2' }), BadRequestException);
});

test('update event can decline participation without deleting the event', async () => {
  const remoteUpdateCalls: Array<Record<string, unknown>> = [];
  const upsertCalls: Array<Record<string, unknown>> = [];
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
      findEventById: async () => ({
        accountDisplayName: 'Rafa Work',
        accountEmail: 'rafa@work.dev',
        accountId: 'account-1',
        attendees: [
          { email: 'rafa@work.dev', responseStatus: 'accepted', self: true },
          { email: 'guest@work.dev', responseStatus: 'accepted' },
        ],
        calendarColorHex: '#3367D6',
        calendarId: 'calendar-1',
        calendarIsIncluded: true,
        calendarName: 'Primary',
        description: 'Daily do produto',
        endAt: new Date('2026-03-22T10:00:00.000Z'),
        id: 'calendar-1:event-1',
        isAllDay: false,
        location: 'Meet',
        meetLink: null,
        projectId: null,
        recurrenceRule: null,
        recurringEventId: null,
        responseStatus: 'accepted',
        startAt: new Date('2026-03-22T09:00:00.000Z'),
        syncedAt: new Date('2026-03-22T08:50:00.000Z'),
        title: 'Daily operacional',
        updatedAt: new Date('2026-03-22T08:50:00.000Z'),
      }),
      upsertEvent: async (input: Record<string, unknown>) => {
        upsertCalls.push(input);
        return { id: 'calendar-1:event-1' };
      },
    },
    eventsRemoteWriterService: {
      updateEvent: async (_source: unknown, _remoteEventId: string, input: Record<string, unknown>) => {
        remoteUpdateCalls.push(input);

        return {
          attendees: [
            { email: 'rafa@work.dev', responseStatus: 'declined', self: true },
            { email: 'guest@work.dev', responseStatus: 'accepted' },
          ],
          end: { dateTime: '2026-03-22T10:00:00.000Z' },
          id: 'event-1',
          location: 'Meet',
          start: { dateTime: '2026-03-22T09:00:00.000Z' },
          summary: 'Daily operacional',
        };
      },
    },
  });

  const result = await useCase.execute('calendar-1:event-1', 'user-1', { responseStatus: 'declined' });

  assert.equal(remoteUpdateCalls.length, 1);
  assert.deepEqual(remoteUpdateCalls[0]?.attendees, [
    { email: 'rafa@work.dev', responseStatus: 'declined' },
    { email: 'guest@work.dev', responseStatus: 'accepted' },
  ]);
  assert.equal(upsertCalls.length, 1);
  assert.equal(upsertCalls[0]?.responseStatus, 'declined');
  assert.equal(result.id, 'calendar-1:event-1');
  assert.equal(result.responseStatus, 'declined');
});

test('update event can confirm participation for a pending invite', async () => {
  const remoteUpdateCalls: Array<Record<string, unknown>> = [];
  const upsertCalls: Array<Record<string, unknown>> = [];
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
      findEventById: async () => ({
        accountDisplayName: 'Rafa Work',
        accountEmail: 'rafa@work.dev',
        accountId: 'account-1',
        attendees: [
          { email: 'rafa@work.dev', responseStatus: 'needsAction', self: true },
          { email: 'guest@work.dev', responseStatus: 'accepted' },
        ],
        calendarColorHex: '#3367D6',
        calendarId: 'calendar-1',
        calendarIsIncluded: true,
        calendarName: 'Primary',
        description: 'Refinamento',
        endAt: new Date('2026-03-22T12:00:00.000Z'),
        id: 'calendar-1:event-2',
        isAllDay: false,
        location: null,
        meetLink: null,
        projectId: null,
        recurrenceRule: null,
        recurringEventId: null,
        responseStatus: 'needsAction',
        startAt: new Date('2026-03-22T11:00:00.000Z'),
        syncedAt: new Date('2026-03-22T08:50:00.000Z'),
        title: 'Planejamento semanal',
        updatedAt: new Date('2026-03-22T08:50:00.000Z'),
      }),
      upsertEvent: async (input: Record<string, unknown>) => {
        upsertCalls.push(input);
        return { id: 'calendar-1:event-2' };
      },
    },
    eventsRemoteWriterService: {
      updateEvent: async (_source: unknown, _remoteEventId: string, input: Record<string, unknown>) => {
        remoteUpdateCalls.push(input);

        return {
          attendees: [
            { email: 'rafa@work.dev', responseStatus: 'accepted', self: true },
            { email: 'guest@work.dev', responseStatus: 'accepted' },
          ],
          end: { dateTime: '2026-03-22T12:00:00.000Z' },
          id: 'event-2',
          start: { dateTime: '2026-03-22T11:00:00.000Z' },
          summary: 'Planejamento semanal',
        };
      },
    },
  });

  const result = await useCase.execute('calendar-1:event-2', 'user-1', { responseStatus: 'accepted' });

  assert.deepEqual(remoteUpdateCalls[0]?.attendees, [
    { email: 'rafa@work.dev', responseStatus: 'accepted' },
    { email: 'guest@work.dev', responseStatus: 'accepted' },
  ]);
  assert.equal(upsertCalls[0]?.responseStatus, 'accepted');
  assert.equal(result.responseStatus, 'accepted');
});

test('update event can reset a participation response back to pending', async () => {
  const remoteUpdateCalls: Array<Record<string, unknown>> = [];
  const upsertCalls: Array<Record<string, unknown>> = [];
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
      findEventById: async () => ({
        accountDisplayName: 'Rafa Work',
        accountEmail: 'rafa@work.dev',
        accountId: 'account-1',
        attendees: [
          { email: 'rafa@work.dev', responseStatus: 'accepted', self: true },
          { email: 'guest@work.dev', responseStatus: 'accepted' },
        ],
        calendarColorHex: '#3367D6',
        calendarId: 'calendar-1',
        calendarIsIncluded: true,
        calendarName: 'Primary',
        description: 'Daily do produto',
        endAt: new Date('2026-03-22T10:00:00.000Z'),
        id: 'calendar-1:event-1',
        isAllDay: false,
        location: 'Meet',
        meetLink: null,
        projectId: null,
        recurrenceRule: null,
        recurringEventId: null,
        responseStatus: 'accepted',
        startAt: new Date('2026-03-22T09:00:00.000Z'),
        syncedAt: new Date('2026-03-22T08:50:00.000Z'),
        title: 'Daily operacional',
        updatedAt: new Date('2026-03-22T08:50:00.000Z'),
      }),
      upsertEvent: async (input: Record<string, unknown>) => {
        upsertCalls.push(input);
        return { id: 'calendar-1:event-1' };
      },
    },
    eventsRemoteWriterService: {
      updateEvent: async (_source: unknown, _remoteEventId: string, input: Record<string, unknown>) => {
        remoteUpdateCalls.push(input);

        return {
          attendees: [
            { email: 'rafa@work.dev', responseStatus: 'needsAction', self: true },
            { email: 'guest@work.dev', responseStatus: 'accepted' },
          ],
          end: { dateTime: '2026-03-22T10:00:00.000Z' },
          id: 'event-1',
          location: 'Meet',
          start: { dateTime: '2026-03-22T09:00:00.000Z' },
          summary: 'Daily operacional',
        };
      },
    },
  });

  const result = await useCase.execute('calendar-1:event-1', 'user-1', { responseStatus: 'needsAction' });

  assert.deepEqual(remoteUpdateCalls[0]?.attendees, [
    { email: 'rafa@work.dev', responseStatus: 'needsAction' },
    { email: 'guest@work.dev', responseStatus: 'accepted' },
  ]);
  assert.equal(upsertCalls[0]?.responseStatus, 'needsAction');
  assert.equal(result.responseStatus, 'needsAction');
});