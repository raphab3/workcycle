import { Module } from '@nestjs/common';

import { AccountsModule } from '@/modules/accounts/accounts.module';
import { EventsController } from '@/modules/events/controllers/events.controller';
import { EventsRepository } from '@/modules/events/repositories/events.repository';
import { EventsFinderService } from '@/modules/events/services/events-finder.service';
import { EventsSyncService } from '@/modules/events/services/events-sync.service';
import { ListCalendarEventsUseCase } from '@/modules/events/use-cases/list-calendar-events.use-case';

@Module({
  imports: [AccountsModule],
  controllers: [EventsController],
  providers: [EventsRepository, EventsSyncService, ListCalendarEventsUseCase, EventsFinderService],
  exports: [EventsRepository, EventsFinderService],
})
export class EventsModule {}