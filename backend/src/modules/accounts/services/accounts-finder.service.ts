import { Injectable } from '@nestjs/common';

import { ListGoogleAccountsUseCase } from '@/modules/accounts/use-cases/list-google-accounts.use-case';

@Injectable()
export class AccountsFinderService {
  constructor(private readonly listGoogleAccountsUseCase: ListGoogleAccountsUseCase) {}

  async listAccounts() {
    return this.listGoogleAccountsUseCase.execute();
  }
}