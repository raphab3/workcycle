import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';

import { createCalendarEventSchema, listCalendarEventsQuerySchema, updateCalendarEventSchema } from '@/modules/events/events.schemas';
import { EventsFinderService } from '@/modules/events/services/events-finder.service';
import { EventsWriterService } from '@/modules/events/services/events-writer.service';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { AuthGuard } from '@/shared/guards/auth.guard';

import type { AuthTokenPayload } from '@/modules/auth/types/auth';

@Controller('events')
export class EventsController {
  constructor(
    @Inject(EventsFinderService)
    private readonly eventsFinderService: EventsFinderService,
    @Inject(EventsWriterService)
    private readonly eventsWriterService: EventsWriterService,
  ) {}

  @UseGuards(AuthGuard)
  @Get()
  async listEvents(@CurrentUser() user: AuthTokenPayload, @Query() query: unknown) {
    const input = listCalendarEventsQuerySchema.parse(query);

    return this.eventsFinderService.listEvents(user.sub, {
      ...(input.accountIds !== undefined ? { accountIds: input.accountIds } : {}),
      ...(input.calendarIds !== undefined ? { calendarIds: input.calendarIds } : {}),
      from: input.from,
      refresh: input.refresh,
      to: input.to,
    });
  }

  @UseGuards(AuthGuard)
  @Post()
  async create(@CurrentUser() user: AuthTokenPayload, @Body() body: unknown) {
    const input = createCalendarEventSchema.parse(body);

    return this.eventsWriterService.createEvent(user.sub, input);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @CurrentUser() user: AuthTokenPayload, @Body() body: unknown) {
    const input = updateCalendarEventSchema.parse(body);

    return this.eventsWriterService.updateEvent(id, user.sub, input);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user: AuthTokenPayload) {
    return this.eventsWriterService.deleteEvent(id, user.sub);
  }
}