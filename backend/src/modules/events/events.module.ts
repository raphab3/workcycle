import { Module } from '@nestjs/common';

import { EventsController } from '@/modules/events/controllers/events.controller';
import { EventsRepository } from '@/modules/events/repositories/events.repository';
import { EventsFinderService } from '@/modules/events/services/events-finder.service';
import { ListCalendarEventsUseCase } from '@/modules/events/use-cases/list-calendar-events.use-case';

@Module({
  controllers: [EventsController],
  providers: [EventsRepository, ListCalendarEventsUseCase, EventsFinderService],
  exports: [EventsRepository, EventsFinderService],
})
export class EventsModule {}