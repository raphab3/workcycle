import { Injectable } from '@nestjs/common';

import { AccountingRepository } from '@/modules/accounting/repositories/accounting.repository';

@Injectable()
export class ListAccountingStatusesUseCase {
  constructor(private readonly accountingRepository: AccountingRepository) {}

  async execute() {
    return this.accountingRepository.listStatuses();
  }
}