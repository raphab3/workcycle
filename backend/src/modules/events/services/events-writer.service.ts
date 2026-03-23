import { Inject, Injectable } from '@nestjs/common';

import { CreateCalendarEventUseCase } from '@/modules/events/use-cases/create-calendar-event.use-case';
import { DeleteCalendarEventUseCase } from '@/modules/events/use-cases/delete-calendar-event.use-case';
import { UpdateCalendarEventUseCase } from '@/modules/events/use-cases/update-calendar-event.use-case';

import type { CreateCalendarEventInput, UpdateCalendarEventInput } from '@/modules/events/events.schemas';

@Injectable()
export class EventsWriterService {
  constructor(
    @Inject(CreateCalendarEventUseCase)
    private readonly createCalendarEventUseCase: CreateCalendarEventUseCase,
    @Inject(UpdateCalendarEventUseCase)
    private readonly updateCalendarEventUseCase: UpdateCalendarEventUseCase,
    @Inject(DeleteCalendarEventUseCase)
    private readonly deleteCalendarEventUseCase: DeleteCalendarEventUseCase,
  ) {}

  async createEvent(userId: string, input: CreateCalendarEventInput) {
    return this.createCalendarEventUseCase.execute(userId, input);
  }

  async updateEvent(id: string, userId: string, input: UpdateCalendarEventInput) {
    return this.updateCalendarEventUseCase.execute(id, userId, input);
  }

  async deleteEvent(id: string, userId: string) {
    return this.deleteCalendarEventUseCase.execute(id, userId);
  }
}