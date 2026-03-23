import { Body, Controller, Get, Inject, Patch, Param, UseGuards } from '@nestjs/common';

import { updateGoogleCalendarSchema } from '@/modules/accounts/accounts.schemas';
import { AccountsFinderService } from '@/modules/accounts/services/accounts-finder.service';
import { AccountsWriterService } from '@/modules/accounts/services/accounts-writer.service';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { AuthGuard } from '@/shared/guards/auth.guard';

import type { AuthTokenPayload } from '@/modules/auth/types/auth';

@Controller('accounts')
export class AccountsController {
  constructor(
    @Inject(AccountsFinderService)
    private readonly accountsFinderService: AccountsFinderService,
    @Inject(AccountsWriterService)
    private readonly accountsWriterService: AccountsWriterService,
  ) {}

  @UseGuards(AuthGuard)
  @Get()
  async listAccounts(@CurrentUser() user: AuthTokenPayload) {
    return this.accountsFinderService.listAccounts(user.sub);
  }

  @UseGuards(AuthGuard)
  @Patch('calendars/:id')
  async updateCalendar(@Param('id') id: string, @CurrentUser() user: AuthTokenPayload, @Body() body: unknown) {
    const input = updateGoogleCalendarSchema.parse(body);

    return this.accountsWriterService.updateCalendar(id, user.sub, input.isIncluded);
  }
}