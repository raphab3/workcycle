import { Injectable } from '@nestjs/common';
import { and, desc, eq, leftJoin } from 'drizzle-orm';

import { DrizzleService } from '@/shared/database/drizzle.service';
import { googleAccounts, googleCalendars } from '@/shared/database/schema';

@Injectable()
export class AccountsRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async listAccounts(userId: string) {
    return this.drizzleService.db
      .select({
        accountDisplayName: googleAccounts.displayName,
        accountEmail: googleAccounts.email,
        accountId: googleAccounts.id,
        accountIsActive: googleAccounts.isActive,
        accountTokenExpiresAt: googleAccounts.tokenExpiresAt,
        accountUpdatedAt: googleAccounts.updatedAt,
        calendarAccountId: googleCalendars.accountId,
        calendarColorHex: googleCalendars.colorHex,
        calendarId: googleCalendars.id,
        calendarIsIncluded: googleCalendars.isIncluded,
        calendarIsPrimary: googleCalendars.isPrimary,
        calendarName: googleCalendars.name,
        calendarSyncedAt: googleCalendars.syncedAt,
      })
      .from(googleAccounts)
      .leftJoin(googleCalendars, eq(googleCalendars.accountId, googleAccounts.id))
      .where(eq(googleAccounts.userId, userId))
      .orderBy(desc(googleAccounts.updatedAt), googleCalendars.name);
  }

  async findCalendar(calendarId: string, userId: string) {
    const [calendar] = await this.drizzleService.db
      .select({
        id: googleCalendars.id,
      })
      .from(googleCalendars)
      .innerJoin(googleAccounts, eq(googleAccounts.id, googleCalendars.accountId))
      .where(and(eq(googleCalendars.id, calendarId), eq(googleAccounts.userId, userId)));

    return calendar;
  }

  async updateCalendar(calendarId: string, input: Pick<typeof googleCalendars.$inferInsert, 'isIncluded'>) {
    const [calendar] = await this.drizzleService.db
      .update(googleCalendars)
      .set({
        isIncluded: input.isIncluded,
        updatedAt: new Date(),
      })
      .where(eq(googleCalendars.id, calendarId))
      .returning({
        accountId: googleCalendars.accountId,
        colorHex: googleCalendars.colorHex,
        id: googleCalendars.id,
        isIncluded: googleCalendars.isIncluded,
        isPrimary: googleCalendars.isPrimary,
        name: googleCalendars.name,
        syncedAt: googleCalendars.syncedAt,
      });

    return calendar;
  }
}