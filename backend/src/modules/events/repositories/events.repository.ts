import { Injectable } from '@nestjs/common';
import { desc } from 'drizzle-orm';

import { DrizzleService } from '@/shared/database/drizzle.service';
import { calendarEvents } from '@/shared/database/schema';

@Injectable()
export class EventsRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async listEvents() {
    return this.drizzleService.db
      .select({
        id: calendarEvents.id,
        calendarId: calendarEvents.calendarId,
        title: calendarEvents.title,
        startAt: calendarEvents.startAt,
        endAt: calendarEvents.endAt,
        responseStatus: calendarEvents.responseStatus,
        projectId: calendarEvents.projectId,
        updatedAt: calendarEvents.updatedAt,
      })
      .from(calendarEvents)
      .orderBy(desc(calendarEvents.startAt));
  }
}