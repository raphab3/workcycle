import { Controller, Get } from '@nestjs/common';

import { AccountingFinderService } from '@/modules/accounting/services/accounting-finder.service';

@Controller('accounting')
export class AccountingController {
  constructor(private readonly accountingFinderService: AccountingFinderService) {}

  @Get('statuses')
  async listStatuses() {
    return this.accountingFinderService.listStatuses();
  }
}