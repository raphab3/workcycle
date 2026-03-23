import { Controller, Get, Query, UseGuards } from '@nestjs/common';

import { listCalendarEventsQuerySchema } from '@/modules/events/events.schemas';
import { EventsFinderService } from '@/modules/events/services/events-finder.service';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { AuthGuard } from '@/shared/guards/auth.guard';

import type { AuthTokenPayload } from '@/modules/auth/types/auth';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsFinderService: EventsFinderService) {}

  @UseGuards(AuthGuard)
  @Get()
  async listEvents(@CurrentUser() user: AuthTokenPayload, @Query() query: unknown) {
    const input = listCalendarEventsQuerySchema.parse(query);

    return this.eventsFinderService.listEvents(user.sub, input);
  }
}