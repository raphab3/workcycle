import { Module } from '@nestjs/common';

import { AccountsModule } from '@/modules/accounts/accounts.module';
import { EventsController } from '@/modules/events/controllers/events.controller';
import { EventsRepository } from '@/modules/events/repositories/events.repository';
import { EventsFinderService } from '@/modules/events/services/events-finder.service';
import { EventsRemoteWriterService } from '@/modules/events/services/events-remote-writer.service';
import { EventsSyncService } from '@/modules/events/services/events-sync.service';
import { EventsWriterService } from '@/modules/events/services/events-writer.service';
import { CreateCalendarEventUseCase } from '@/modules/events/use-cases/create-calendar-event.use-case';
import { DeleteCalendarEventUseCase } from '@/modules/events/use-cases/delete-calendar-event.use-case';
import { ListCalendarEventsUseCase } from '@/modules/events/use-cases/list-calendar-events.use-case';
import { UpdateCalendarEventUseCase } from '@/modules/events/use-cases/update-calendar-event.use-case';

@Module({
  imports: [AccountsModule],
  controllers: [EventsController],
  providers: [
    EventsRepository,
    EventsRemoteWriterService,
    EventsSyncService,
    ListCalendarEventsUseCase,
    CreateCalendarEventUseCase,
    UpdateCalendarEventUseCase,
    DeleteCalendarEventUseCase,
    EventsFinderService,
    EventsWriterService,
  ],
  exports: [EventsRepository, EventsFinderService, EventsWriterService],
})
export class EventsModule {}