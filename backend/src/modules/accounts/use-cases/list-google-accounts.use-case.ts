import { Injectable } from '@nestjs/common';

import { AccountsRepository } from '@/modules/accounts/repositories/accounts.repository';

@Injectable()
export class ListGoogleAccountsUseCase {
  constructor(private readonly accountsRepository: AccountsRepository) {}

  async execute(userId: string) {
    return this.accountsRepository.listAccounts(userId);
  }
}