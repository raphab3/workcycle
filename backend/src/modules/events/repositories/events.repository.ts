import { Injectable } from '@nestjs/common';
import { and, desc, eq, gt, inArray, lt, notInArray } from 'drizzle-orm';

import { DrizzleService } from '@/shared/database/drizzle.service';
import { calendarEvents, googleAccounts, googleCalendars } from '@/shared/database/schema';

import type { NewCalendarEvent } from '@/shared/database/schema';

@Injectable()
export class EventsRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async findEventById(id: string, userId: string) {
    const [event] = await this.drizzleService.db
      .select({
        accountDisplayName: googleAccounts.displayName,
        accountEmail: googleAccounts.email,
        accountId: googleAccounts.id,
        attendees: calendarEvents.attendees,
        calendarColorHex: googleCalendars.colorHex,
        calendarId: calendarEvents.calendarId,
        calendarIsIncluded: googleCalendars.isIncluded,
        calendarName: googleCalendars.name,
        description: calendarEvents.description,
        endAt: calendarEvents.endAt,
        id: calendarEvents.id,
        isAllDay: calendarEvents.isAllDay,
        location: calendarEvents.location,
        meetLink: calendarEvents.meetLink,
        projectId: calendarEvents.projectId,
        recurrenceRule: calendarEvents.recurrenceRule,
        recurringEventId: calendarEvents.recurringEventId,
        responseStatus: calendarEvents.responseStatus,
        startAt: calendarEvents.startAt,
        syncedAt: calendarEvents.syncedAt,
        title: calendarEvents.title,
        updatedAt: calendarEvents.updatedAt,
      })
      .from(calendarEvents)
      .innerJoin(googleCalendars, eq(googleCalendars.id, calendarEvents.calendarId))
      .innerJoin(googleAccounts, eq(googleAccounts.id, googleCalendars.accountId))
      .where(and(eq(calendarEvents.id, id), eq(googleAccounts.userId, userId)));

    return event;
  }

  async listEventsByInterval(
    userId: string,
    input: { accountIds?: string[]; calendarIds?: string[]; from: Date; to: Date },
  ) {
    const conditions = [
      eq(googleAccounts.userId, userId),
      eq(googleCalendars.isIncluded, true),
      lt(calendarEvents.startAt, input.to),
      gt(calendarEvents.endAt, input.from),
    ];

    if (input.accountIds && input.accountIds.length > 0) {
      conditions.push(inArray(googleAccounts.id, input.accountIds));
    }

    if (input.calendarIds && input.calendarIds.length > 0) {
      conditions.push(inArray(googleCalendars.id, input.calendarIds));
    }

    return this.drizzleService.db
      .select({
        accountDisplayName: googleAccounts.displayName,
        accountEmail: googleAccounts.email,
        accountId: googleAccounts.id,
        attendees: calendarEvents.attendees,
        calendarColorHex: googleCalendars.colorHex,
        id: calendarEvents.id,
        calendarId: calendarEvents.calendarId,
        calendarName: googleCalendars.name,
        description: calendarEvents.description,
        isAllDay: calendarEvents.isAllDay,
        location: calendarEvents.location,
        meetLink: calendarEvents.meetLink,
        projectId: calendarEvents.projectId,
        recurrenceRule: calendarEvents.recurrenceRule,
        recurringEventId: calendarEvents.recurringEventId,
        title: calendarEvents.title,
        startAt: calendarEvents.startAt,
        endAt: calendarEvents.endAt,
        responseStatus: calendarEvents.responseStatus,
        syncedAt: calendarEvents.syncedAt,
        updatedAt: calendarEvents.updatedAt,
      })
      .from(calendarEvents)
      .innerJoin(googleCalendars, eq(googleCalendars.id, calendarEvents.calendarId))
      .innerJoin(googleAccounts, eq(googleAccounts.id, googleCalendars.accountId))
      .where(and(...conditions))
      .orderBy(desc(calendarEvents.startAt));
  }

  async upsertEvent(event: NewCalendarEvent) {
    const [persistedEvent] = await this.drizzleService.db
      .insert(calendarEvents)
      .values(event)
      .onConflictDoUpdate({
        target: calendarEvents.id,
        set: {
          attendees: event.attendees,
          calendarId: event.calendarId,
          description: event.description ?? null,
          endAt: event.endAt,
          isAllDay: event.isAllDay,
          location: event.location ?? null,
          meetLink: event.meetLink ?? null,
          projectId: event.projectId ?? null,
          recurrenceRule: event.recurrenceRule ?? null,
          recurringEventId: event.recurringEventId ?? null,
          responseStatus: event.responseStatus,
          startAt: event.startAt,
          syncedAt: event.syncedAt,
          title: event.title,
          updatedAt: new Date(),
        },
      })
      .returning({
        id: calendarEvents.id,
      });

    return persistedEvent;
  }

  async deleteEvent(id: string) {
    return this.drizzleService.db
      .delete(calendarEvents)
      .where(eq(calendarEvents.id, id));
  }

  async deleteMissingCalendarEvents(calendarId: string, from: Date, to: Date, persistedIds: string[]) {
    const conditions = [
      eq(calendarEvents.calendarId, calendarId),
      lt(calendarEvents.startAt, to),
      gt(calendarEvents.endAt, from),
    ];

    if (persistedIds.length > 0) {
      conditions.push(notInArray(calendarEvents.id, persistedIds));
    }

    return this.drizzleService.db
      .delete(calendarEvents)
      .where(and(...conditions));
  }
}