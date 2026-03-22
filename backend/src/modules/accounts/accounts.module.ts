import { Module } from '@nestjs/common';

import { AccountsController } from '@/modules/accounts/controllers/accounts.controller';
import { AccountsRepository } from '@/modules/accounts/repositories/accounts.repository';
import { AccountsFinderService } from '@/modules/accounts/services/accounts-finder.service';
import { ListGoogleAccountsUseCase } from '@/modules/accounts/use-cases/list-google-accounts.use-case';

@Module({
  controllers: [AccountsController],
  providers: [AccountsRepository, ListGoogleAccountsUseCase, AccountsFinderService],
  exports: [AccountsRepository, AccountsFinderService],
})
export class AccountsModule {}