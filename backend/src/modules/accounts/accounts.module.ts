import { Module } from '@nestjs/common';

import { AccountsController } from '@/modules/accounts/controllers/accounts.controller';
import { AccountsRepository } from '@/modules/accounts/repositories/accounts.repository';
import { AccountsFinderService } from '@/modules/accounts/services/accounts-finder.service';
import { AccountsWriterService } from '@/modules/accounts/services/accounts-writer.service';
import { ListGoogleAccountsUseCase } from '@/modules/accounts/use-cases/list-google-accounts.use-case';
import { UpdateGoogleCalendarUseCase } from '@/modules/accounts/use-cases/update-google-calendar.use-case';

@Module({
  controllers: [AccountsController],
  providers: [AccountsRepository, ListGoogleAccountsUseCase, UpdateGoogleCalendarUseCase, AccountsFinderService, AccountsWriterService],
  exports: [AccountsRepository, AccountsFinderService, AccountsWriterService],
})
export class AccountsModule {}