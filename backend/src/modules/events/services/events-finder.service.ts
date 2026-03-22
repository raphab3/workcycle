import { Injectable } from '@nestjs/common';

import { ListCalendarEventsUseCase } from '@/modules/events/use-cases/list-calendar-events.use-case';

@Injectable()
export class EventsFinderService {
  constructor(private readonly listCalendarEventsUseCase: ListCalendarEventsUseCase) {}

  async listEvents() {
    return this.listCalendarEventsUseCase.execute();
  }
}