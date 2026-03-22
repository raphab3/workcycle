import { Controller, Get } from '@nestjs/common';

import { AccountsFinderService } from '@/modules/accounts/services/accounts-finder.service';

@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsFinderService: AccountsFinderService) {}

  @Get()
  async listAccounts() {
    return this.accountsFinderService.listAccounts();
  }
}