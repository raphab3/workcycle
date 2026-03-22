import { Controller, Get, UseGuards } from '@nestjs/common';

import { AccountsFinderService } from '@/modules/accounts/services/accounts-finder.service';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { AuthGuard } from '@/shared/guards/auth.guard';

import type { AuthTokenPayload } from '@/modules/auth/types/auth';

@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsFinderService: AccountsFinderService) {}

  @UseGuards(AuthGuard)
  @Get()
  async listAccounts(@CurrentUser() user: AuthTokenPayload) {
    return this.accountsFinderService.listAccounts(user.sub);
  }
}