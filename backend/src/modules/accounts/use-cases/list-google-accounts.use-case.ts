import { Inject, Injectable } from '@nestjs/common';

import { AccountsRepository } from '@/modules/accounts/repositories/accounts.repository';
import { toGoogleAccountConnections } from '@/modules/accounts/types/account';

@Injectable()
export class ListGoogleAccountsUseCase {
  constructor(
    @Inject(AccountsRepository)
    private readonly accountsRepository: AccountsRepository,
  ) {}

  async execute(userId: string) {
    const rows = await this.accountsRepository.listAccounts(userId);

    return toGoogleAccountConnections(rows);
  }
}