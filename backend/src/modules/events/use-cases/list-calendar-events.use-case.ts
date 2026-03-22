import { Injectable } from '@nestjs/common';

import { EventsRepository } from '@/modules/events/repositories/events.repository';

@Injectable()
export class ListCalendarEventsUseCase {
  constructor(private readonly eventsRepository: EventsRepository) {}

  async execute() {
    return this.eventsRepository.listEvents();
  }
}