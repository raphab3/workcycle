import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';

import { DrizzleService } from '@/shared/database/drizzle.service';
import { googleAccounts, userSettings, users } from '@/shared/database/schema';

import type { NewUserSettings } from '@/shared/database/schema';

@Injectable()
export class SettingsRepository {
  constructor(
    @Inject(DrizzleService)
    private readonly drizzleService: DrizzleService,
  ) {}

  async createUserSettings(input: NewUserSettings) {
    const [settings] = await this.drizzleService.db
      .insert(userSettings)
      .values(input)
      .returning();

    if (!settings) {
      throw new InternalServerErrorException('User settings creation failed.');
    }

    return settings;
  }

  async findUserGoogleConnection(userId: string) {
    const [row] = await this.drizzleService.db
      .select({
        googleAccountCount: sql<number>`count(${googleAccounts.id})`,
        googleLinkedAt: users.googleLinkedAt,
      })
      .from(users)
      .leftJoin(googleAccounts, eq(googleAccounts.userId, users.id))
      .where(eq(users.id, userId))
      .groupBy(users.id, users.googleLinkedAt)
      .limit(1);

    return row ?? null;
  }

  async findUserSettingsByUserId(userId: string) {
    const [settings] = await this.drizzleService.db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId))
      .limit(1);

    return settings ?? null;
  }

  async upsertUserSettings(userId: string, input: Partial<NewUserSettings>) {
    const [settings] = await this.drizzleService.db
      .insert(userSettings)
      .values({ userId, ...input })
      .onConflictDoUpdate({
        target: userSettings.userId,
        set: {
          ...input,
          updatedAt: new Date(),
        },
      })
      .returning();

    if (!settings) {
      throw new InternalServerErrorException('User settings upsert failed.');
    }

    return settings;
  }
}