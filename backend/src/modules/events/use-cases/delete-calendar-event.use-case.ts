import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { AccountsRepository } from '@/modules/accounts/repositories/accounts.repository';
import { EventsRepository } from '@/modules/events/repositories/events.repository';
import { EventsRemoteWriterService } from '@/modules/events/services/events-remote-writer.service';
import { toRemoteCalendarEventId } from '@/modules/events/types/event';

@Injectable()
export class DeleteCalendarEventUseCase {
  constructor(
    @Inject(AccountsRepository)
    private readonly accountsRepository: AccountsRepository,
    @Inject(EventsRepository)
    private readonly eventsRepository: EventsRepository,
    @Inject(EventsRemoteWriterService)
    private readonly eventsRemoteWriterService: EventsRemoteWriterService,
  ) {}

  async execute(id: string, userId: string) {
    const existing = await this.eventsRepository.findEventById(id, userId);

    if (!existing) {
      throw new NotFoundException('Calendar event not found.');
    }

    const source = await this.accountsRepository.findCalendarSource(existing.calendarId, userId);

    if (!source) {
      throw new NotFoundException('Target calendar was not found for the authenticated user.');
    }

    await this.eventsRemoteWriterService.deleteEvent(source, toRemoteCalendarEventId(existing.calendarId, existing.id));
    await this.eventsRepository.deleteEvent(existing.id);

    return {
      deleted: true as const,
      id: existing.id,
    };
  }
}