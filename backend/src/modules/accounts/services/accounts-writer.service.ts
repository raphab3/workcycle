import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';

import { UpdateGoogleCalendarUseCase } from '@/modules/accounts/use-cases/update-google-calendar.use-case';

function ensureCalendarPersisted<T>(calendar: T | undefined) {
  if (!calendar) {
    throw new InternalServerErrorException('Google calendar update did not return a persisted entity.');
  }

  return calendar;
}

@Injectable()
export class AccountsWriterService {
  constructor(
    @Inject(UpdateGoogleCalendarUseCase)
    private readonly updateGoogleCalendarUseCase: UpdateGoogleCalendarUseCase,
  ) {}

  async updateCalendar(calendarId: string, userId: string, isIncluded: boolean) {
    return ensureCalendarPersisted(await this.updateGoogleCalendarUseCase.execute(calendarId, userId, isIncluded));
  }
}