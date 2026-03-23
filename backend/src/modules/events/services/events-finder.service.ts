import { Inject, Injectable } from '@nestjs/common';

import { ListCalendarEventsUseCase } from '@/modules/events/use-cases/list-calendar-events.use-case';

import type { ListCalendarEventsInputDTO } from '@/modules/events/types/event';

@Injectable()
export class EventsFinderService {
  constructor(
    @Inject(ListCalendarEventsUseCase)
    private readonly listCalendarEventsUseCase: ListCalendarEventsUseCase,
  ) {}

  async listEvents(userId: string, input: ListCalendarEventsInputDTO) {
    return this.listCalendarEventsUseCase.execute(userId, input);
  }
}