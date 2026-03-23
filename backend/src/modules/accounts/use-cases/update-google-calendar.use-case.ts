import { Injectable, NotFoundException } from '@nestjs/common';

import { AccountsRepository } from '@/modules/accounts/repositories/accounts.repository';

@Injectable()
export class UpdateGoogleCalendarUseCase {
  constructor(private readonly accountsRepository: AccountsRepository) {}

  async execute(calendarId: string, userId: string, isIncluded: boolean) {
    const calendar = await this.accountsRepository.findCalendar(calendarId, userId);

    if (!calendar) {
      throw new NotFoundException('Google calendar not found for the authenticated user.');
    }

    return this.accountsRepository.updateCalendar(calendarId, { isIncluded });
  }
}