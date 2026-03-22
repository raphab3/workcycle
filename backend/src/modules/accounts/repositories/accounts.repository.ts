import { Injectable } from '@nestjs/common';
import { desc, eq } from 'drizzle-orm';

import { DrizzleService } from '@/shared/database/drizzle.service';
import { googleAccounts } from '@/shared/database/schema';

@Injectable()
export class AccountsRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async listAccounts(userId: string) {
    return this.drizzleService.db
      .select({
        id: googleAccounts.id,
        email: googleAccounts.email,
        displayName: googleAccounts.displayName,
        isActive: googleAccounts.isActive,
        tokenExpiresAt: googleAccounts.tokenExpiresAt,
        updatedAt: googleAccounts.updatedAt,
      })
      .from(googleAccounts)
      .where(eq(googleAccounts.userId, userId))
      .orderBy(desc(googleAccounts.updatedAt));
  }
}