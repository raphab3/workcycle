import { BadRequestException, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';

import { AccountsRepository } from '@/modules/accounts/repositories/accounts.repository';
import { EventsRepository } from '@/modules/events/repositories/events.repository';
import { EventsRemoteWriterService } from '@/modules/events/services/events-remote-writer.service';
import { toCalendarEventResponse, toPersistedCalendarEvent } from '@/modules/events/types/event';

import type { CreateCalendarEventInput } from '@/modules/events/events.schemas';

@Injectable()
export class CreateCalendarEventUseCase {
  constructor(
    @Inject(AccountsRepository)
    private readonly accountsRepository: AccountsRepository,
    @Inject(EventsRepository)
    private readonly eventsRepository: EventsRepository,
    @Inject(EventsRemoteWriterService)
    private readonly eventsRemoteWriterService: EventsRemoteWriterService,
  ) {}

  async execute(userId: string, input: CreateCalendarEventInput) {
    const source = await this.accountsRepository.findCalendarSource(input.calendarId, userId);

    if (!source) {
      throw new NotFoundException('Target calendar was not found for the authenticated user.');
    }

    if (!source.calendarIsIncluded) {
      throw new BadRequestException('Calendars excluded from the agenda cannot receive new operational events.');
    }

    const remoteEvent = await this.eventsRemoteWriterService.createEvent(source, input);
    const persistedRecord = toPersistedCalendarEvent(source, remoteEvent, new Date());

    try {
      const persisted = await this.eventsRepository.upsertEvent(persistedRecord);

      if (!persisted) {
        throw new InternalServerErrorException('Expected persisted event after Google event creation.');
      }
    } catch (error) {
      await this.eventsRemoteWriterService.rollbackCreatedEvent(source, remoteEvent.id);
      throw error;
    }

    if (!persistedRecord.startAt || !persistedRecord.endAt || !persistedRecord.syncedAt || !persistedRecord.title) {
      throw new InternalServerErrorException('Persisted event payload is incomplete after Google event creation.');
    }

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