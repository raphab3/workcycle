import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import { DrizzleService } from '@/shared/database/drizzle.service';
import { googleAccounts, users } from '@/shared/database/schema';

import type { AuthProvider } from '@/modules/auth/types/auth';

interface UpsertGoogleAccountInput {
  accessToken: string;
  displayName: string;
  email: string;
  googleId: string;
  refreshToken: string;
  tokenExpiresAt: Date;
  userId: string;
}

@Injectable()
export class AuthRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async createUser(input: { authProvider: AuthProvider; displayName: string; email: string; passwordHash?: string | null }) {
    const [user] = await this.drizzleService.db
      .insert(users)
      .values({
        authProvider: input.authProvider,
        displayName: input.displayName,
        email: input.email,
        passwordHash: input.passwordHash ?? null,
      })
      .returning();

    return user;
  }

  async findUserByEmail(email: string) {
    const [user] = await this.drizzleService.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return user ?? null;
  }

  async findUserById(userId: string) {
    const [user] = await this.drizzleService.db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return user ?? null;
  }

  async findGoogleAccountByGoogleId(googleId: string) {
    const [googleAccount] = await this.drizzleService.db
      .select()
      .from(googleAccounts)
      .where(eq(googleAccounts.googleId, googleId))
      .limit(1);

    return googleAccount ?? null;
  }

  async findGoogleAccountByEmail(email: string) {
    const [googleAccount] = await this.drizzleService.db
      .select()
      .from(googleAccounts)
      .where(eq(googleAccounts.email, email))
      .limit(1);

    return googleAccount ?? null;
  }

  async listGoogleAccountsByUserId(userId: string) {
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
      .where(eq(googleAccounts.userId, userId));
  }

  async upsertGoogleAccount(input: UpsertGoogleAccountInput) {
    const [googleAccount] = await this.drizzleService.db
      .insert(googleAccounts)
      .values({
        accessToken: input.accessToken,
        displayName: input.displayName,
        email: input.email,
        googleId: input.googleId,
        refreshToken: input.refreshToken,
        tokenExpiresAt: input.tokenExpiresAt,
        userId: input.userId,
      })
      .onConflictDoUpdate({
        target: googleAccounts.googleId,
        set: {
          accessToken: input.accessToken,
          displayName: input.displayName,
          email: input.email,
          isActive: true,
          refreshToken: input.refreshToken,
          tokenExpiresAt: input.tokenExpiresAt,
          updatedAt: new Date(),
          userId: input.userId,
        },
      })
      .returning();

    return googleAccount;
  }

  async updateUser(input: { authProvider: AuthProvider; displayName: string; googleLinkedAt?: Date | null; passwordHash?: string | null; userId: string }) {
    const [user] = await this.drizzleService.db
      .update(users)
      .set({
        authProvider: input.authProvider,
        displayName: input.displayName,
        googleLinkedAt: input.googleLinkedAt,
        passwordHash: input.passwordHash,
        updatedAt: new Date(),
      })
      .where(eq(users.id, input.userId))
      .returning();

    return user;
  }
}