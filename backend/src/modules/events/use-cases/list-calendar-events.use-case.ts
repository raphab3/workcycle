import { Injectable } from '@nestjs/common';

import { EventsRepository } from '@/modules/events/repositories/events.repository';
import { EventsSyncService } from '@/modules/events/services/events-sync.service';

import { toCalendarEventResponse } from '@/modules/events/types/event';

import type { ListCalendarEventsInputDTO, ListCalendarEventsResultDTO } from '@/modules/events/types/event';

@Injectable()
export class ListCalendarEventsUseCase {
  constructor(
    private readonly eventsRepository: EventsRepository,
    private readonly eventsSyncService: EventsSyncService,
  ) {}

  async execute(userId: string, input: ListCalendarEventsInputDTO): Promise<ListCalendarEventsResultDTO> {
    const degradedSources = input.refresh ? await this.eventsSyncService.refreshEvents(userId, input) : [];
    const events = await this.eventsRepository.listEventsByInterval(userId, {
      ...(input.accountIds !== undefined ? { accountIds: input.accountIds } : {}),
      ...(input.calendarIds !== undefined ? { calendarIds: input.calendarIds } : {}),
      from: new Date(input.from),
      to: new Date(input.to),
    });

    return {
      degradedSources,
      events: toCalendarEventResponse(events),
    };
  }
}