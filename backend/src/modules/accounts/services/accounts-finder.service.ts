import { Inject, Injectable } from '@nestjs/common';

import { ListGoogleAccountsUseCase } from '@/modules/accounts/use-cases/list-google-accounts.use-case';

@Injectable()
export class AccountsFinderService {
  constructor(
    @Inject(ListGoogleAccountsUseCase)
    private readonly listGoogleAccountsUseCase: ListGoogleAccountsUseCase,
  ) {}

  async listAccounts(userId: string) {
    return this.listGoogleAccountsUseCase.execute(userId);
  }
}