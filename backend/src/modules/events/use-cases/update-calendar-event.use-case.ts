import { BadRequestException, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';

import { AccountsRepository } from '@/modules/accounts/repositories/accounts.repository';
import { EventsRepository } from '@/modules/events/repositories/events.repository';
import { EventsRemoteWriterService } from '@/modules/events/services/events-remote-writer.service';
import { toCalendarEventResponse, toPersistedCalendarEvent, toRemoteCalendarEventId } from '@/modules/events/types/event';

import type { UpdateCalendarEventInput } from '@/modules/events/events.schemas';
import type { CalendarEventListRow } from '@/modules/events/types/event';

function buildUpdatedAttendees(existing: CalendarEventListRow, responseStatus: UpdateCalendarEventInput['responseStatus']) {
  if (!responseStatus) {
    return undefined;
  }

  let resolvedSelfAttendee = false;

  const attendees = existing.attendees.map((attendee) => {
    const attendeeEmail = typeof attendee.email === 'string' ? attendee.email.trim().toLocaleLowerCase() : null;
    const accountEmail = existing.accountEmail.trim().toLocaleLowerCase();
    const matchesSelf = attendee.self === true || attendeeEmail === accountEmail;

    if (!matchesSelf) {
      const { self: _self, ...rest } = attendee;

      return rest;
    }

    resolvedSelfAttendee = true;
    const { self: _self, ...rest } = attendee;

    return {
      ...rest,
      responseStatus,
    };
  });

  if (resolvedSelfAttendee) {
    return attendees;
  }

  return [...attendees, { email: existing.accountEmail, responseStatus }];
}

@Injectable()
export class UpdateCalendarEventUseCase {
  constructor(
    @Inject(AccountsRepository)
    private readonly accountsRepository: AccountsRepository,
    @Inject(EventsRepository)
    private readonly eventsRepository: EventsRepository,
    @Inject(EventsRemoteWriterService)
    private readonly eventsRemoteWriterService: EventsRemoteWriterService,
  ) {}

  async execute(id: string, userId: string, input: UpdateCalendarEventInput) {
    const existing = await this.eventsRepository.findEventById(id, userId);

    if (!existing) {
      throw new NotFoundException('Calendar event not found.');
    }

    if (input.calendarId && input.calendarId !== existing.calendarId) {
      throw new BadRequestException('Moving an event to another calendar is not supported in this first agenda cut.');
    }

    const source = await this.accountsRepository.findCalendarSource(existing.calendarId, userId);

    if (!source) {
      throw new NotFoundException('Target calendar was not found for the authenticated user.');
    }

    const remoteEvent = await this.eventsRemoteWriterService.updateEvent(source, toRemoteCalendarEventId(existing.calendarId, existing.id), {
      attendees: buildUpdatedAttendees(existing, input.responseStatus),
      description: input.description ?? existing.description ?? undefined,
      endAt: input.endAt ?? existing.endAt.toISOString(),
      location: input.location ?? existing.location ?? undefined,
      startAt: input.startAt ?? existing.startAt.toISOString(),
      title: input.title ?? existing.title,
    });
    const persistedRecord = toPersistedCalendarEvent(source, remoteEvent, new Date());

    if (!persistedRecord.startAt || !persistedRecord.endAt || !persistedRecord.syncedAt || !persistedRecord.title) {
      throw new InternalServerErrorException('Persisted event payload is incomplete after Google event update.');
    }

    await this.eventsRepository.upsertEvent(persistedRecord);

    return toCalendarEventResponse([{
      accountDisplayName: source.accountDisplayName,
      accountEmail: source.accountEmail,
      accountId: source.accountId,
      attendees: persistedRecord.attendees,
      calendarColorHex: source.calendarColorHex,
      calendarId: source.calendarId,
      calendarName: source.calendarName,
      description: persistedRecord.description ?? null,
      endAt: persistedRecord.endAt,
      id: persistedRecord.id,
      isAllDay: persistedRecord.isAllDay ?? false,
      location: persistedRecord.location ?? null,
      meetLink: persistedRecord.meetLink ?? null,
      projectId: persistedRecord.projectId ?? null,
      recurrenceRule: persistedRecord.recurrenceRule ?? null,
      recurringEventId: persistedRecord.recurringEventId ?? null,
      responseStatus: persistedRecord.responseStatus ?? 'needsAction',
      startAt: persistedRecord.startAt,
      syncedAt: persistedRecord.syncedAt,
      title: persistedRecord.title,
      updatedAt: persistedRecord.syncedAt,
    }])[0];
  }
}