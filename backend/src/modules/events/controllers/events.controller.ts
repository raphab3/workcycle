import { Controller, Get } from '@nestjs/common';

import { EventsFinderService } from '@/modules/events/services/events-finder.service';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsFinderService: EventsFinderService) {}

  @Get()
  async listEvents() {
    return this.eventsFinderService.listEvents();
  }
}