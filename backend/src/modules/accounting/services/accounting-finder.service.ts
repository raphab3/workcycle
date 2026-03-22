import { Injectable } from '@nestjs/common';

import { ListAccountingStatusesUseCase } from '@/modules/accounting/use-cases/list-accounting-statuses.use-case';

@Injectable()
export class AccountingFinderService {
  constructor(private readonly listAccountingStatusesUseCase: ListAccountingStatusesUseCase) {}

  async listStatuses() {
    return this.listAccountingStatusesUseCase.execute();
  }
}