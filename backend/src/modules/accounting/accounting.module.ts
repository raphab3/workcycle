import { Module } from '@nestjs/common';

import { AccountingController } from '@/modules/accounting/controllers/accounting.controller';
import { AccountingRepository } from '@/modules/accounting/repositories/accounting.repository';
import { AccountingFinderService } from '@/modules/accounting/services/accounting-finder.service';
import { ListAccountingStatusesUseCase } from '@/modules/accounting/use-cases/list-accounting-statuses.use-case';

@Module({
  controllers: [AccountingController],
  providers: [AccountingRepository, ListAccountingStatusesUseCase, AccountingFinderService],
  exports: [AccountingRepository, AccountingFinderService],
})
export class AccountingModule {}