import { and, asc, between, desc, eq, gte, inArray, lte } from 'drizzle-orm';
import { Inject, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';

import { DrizzleService } from '@/shared/database/drizzle.service';
import { cycleSessions, cycleTimeBlocks, projects, tasks, weeklySnapshots } from '@/shared/database/schema';

import type { AppDatabase } from '@/shared/database/drizzle.service';
import type { NewWeeklySnapshot } from '@/shared/database/schema';

@Injectable()
export class WeeklyRepository {
  private readonly logger = new Logger(WeeklyRepository.name);

  constructor(@Inject(DrizzleService) private readonly drizzleService: DrizzleService) {}

  private get db(): AppDatabase {
    return this.drizzleService.db;
  }

  async listProjects(userId: string) {
    return this.db.select().from(projects).where(eq(projects.userId, userId)).orderBy(desc(projects.updatedAt));
  }

  async listTasks(userId: string) {
    return this.db.select().from(tasks).where(eq(tasks.userId, userId)).orderBy(desc(tasks.updatedAt));
  }

  async listCycleSessionsForWeek(userId: string, weekStartsAt: string, weekEndsAt: string) {
    return this.db.select().from(cycleSessions).where(and(
      eq(cycleSessions.userId, userId),
      between(cycleSessions.cycleDate, weekStartsAt, weekEndsAt),
    )).orderBy(asc(cycleSessions.cycleDate));
  }

  async listTimeBlocksForSessions(sessionIds: string[]) {
    if (sessionIds.length === 0) {
      return [];
    }

    return this.db.select().from(cycleTimeBlocks).where(inArray(cycleTimeBlocks.cycleSessionId, sessionIds)).orderBy(asc(cycleTimeBlocks.startedAt));
  }

  async findWeeklySnapshot(userId: string, weekKey: string) {
    try {
      const [snapshot] = await this.db.select().from(weeklySnapshots).where(and(eq(weeklySnapshots.userId, userId), eq(weeklySnapshots.weekKey, weekKey))).limit(1);

      return snapshot ?? null;
    } catch (error) {
      if (this.isWeeklySnapshotsRelationMissing(error)) {
        this.logger.warn('weekly_snapshots table is unavailable; skipping persisted weekly snapshot lookup.');
        return null;
      }

      throw error;
    }
  }

  async listWeeklySnapshots(userId: string, options?: { fromWeekKey?: string; toWeekKey?: string; limit?: number }) {
    const conditions = [eq(weeklySnapshots.userId, userId)];

    if (options?.fromWeekKey) {
      conditions.push(gte(weeklySnapshots.weekKey, options.fromWeekKey));
    }

    if (options?.toWeekKey) {
      conditions.push(lte(weeklySnapshots.weekKey, options.toWeekKey));
    }

    try {
      return await this.db.select().from(weeklySnapshots).where(and(...conditions)).orderBy(desc(weeklySnapshots.weekKey)).limit(options?.limit ?? 12);
    } catch (error) {
      if (this.isWeeklySnapshotsRelationMissing(error)) {
        this.logger.warn('weekly_snapshots table is unavailable; returning derived weekly history without persisted cache.');
        return [];
      }

      throw error;
    }
  }

  async upsertWeeklySnapshot(input: NewWeeklySnapshot) {
    try {
      const [snapshot] = await this.db.insert(weeklySnapshots).values(input).onConflictDoUpdate({
        target: [weeklySnapshots.userId, weeklySnapshots.weekKey],
        set: {
          generatedAt: input.generatedAt,
          isFinal: input.isFinal,
          snapshot: input.snapshot,
          timezone: input.timezone,
          updatedAt: new Date(),
          weekEndsAt: input.weekEndsAt,
          weekStartsAt: input.weekStartsAt,
        },
      }).returning();

      if (!snapshot) {
        throw new InternalServerErrorException('Weekly snapshot upsert failed.');
      }

      return snapshot;
    } catch (error) {
      if (this.isWeeklySnapshotsRelationMissing(error)) {
        this.logger.warn('weekly_snapshots table is unavailable; skipping persisted weekly snapshot cache write.');
        return null;
      }

      throw error;
    }
  }

  private isWeeklySnapshotsRelationMissing(error: unknown) {
    if (!(error instanceof Error)) {
      return false;
    }

    return error.message.includes('relation "weekly_snapshots" does not exist');
  }
}