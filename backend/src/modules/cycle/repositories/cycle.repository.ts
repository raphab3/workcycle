import { and, asc, desc, eq, inArray, sql } from 'drizzle-orm';
import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';

import { DrizzleService } from '@/shared/database/drizzle.service';
import { cycleTimeBlocks, projects, pulseRecords, tasks, cycleSessions } from '@/shared/database/schema';

import type { AppDatabase } from '@/shared/database/drizzle.service';
import type { NewCycleSession, NewCycleTimeBlock, NewPulseRecord } from '@/shared/database/schema';

@Injectable()
export class CycleRepository {
  constructor(@Inject(DrizzleService) private readonly drizzleService: DrizzleService) {}

  private get db(): AppDatabase {
    return this.drizzleService.db;
  }

  async createCycleSession(input: NewCycleSession) {
    const [session] = await this.db.insert(cycleSessions).values(input).returning();

    if (!session) {
      throw new InternalServerErrorException('Cycle session creation failed.');
    }

    return session;
  }

  async findCycleSessionByDate(userId: string, cycleDate: string) {
    const [session] = await this.db.select().from(cycleSessions).where(and(eq(cycleSessions.userId, userId), eq(cycleSessions.cycleDate, cycleDate))).limit(1);

    return session ?? null;
  }

  async findCycleSessionById(id: string, userId: string) {
    const [session] = await this.db.select().from(cycleSessions).where(and(eq(cycleSessions.id, id), eq(cycleSessions.userId, userId))).limit(1);

    return session ?? null;
  }

  async findLatestCycleSession(userId: string) {
    const [session] = await this.db.select().from(cycleSessions).where(eq(cycleSessions.userId, userId)).orderBy(desc(cycleSessions.cycleDate)).limit(1);

    return session ?? null;
  }

  async findProjectById(id: string, userId: string) {
    const [project] = await this.db.select().from(projects).where(and(eq(projects.id, id), eq(projects.userId, userId))).limit(1);

    return project ?? null;
  }

  async listPulseRecords(sessionId: string) {
    return this.db.select().from(pulseRecords).where(eq(pulseRecords.cycleSessionId, sessionId)).orderBy(asc(pulseRecords.firedAt));
  }

  async listTimeBlocks(sessionId: string) {
    return this.db.select().from(cycleTimeBlocks).where(eq(cycleTimeBlocks.cycleSessionId, sessionId)).orderBy(asc(cycleTimeBlocks.startedAt));
  }

  async listTasksForCycleSession(userId: string, cycleSessionId: string) {
    return this.db.select().from(tasks).where(and(eq(tasks.userId, userId), eq(tasks.cycleSessionId, cycleSessionId))).orderBy(desc(tasks.createdAt));
  }

  async listTasksForTaskScope(userId: string, cycleSessionId: string) {
    return this.db.select().from(tasks).where(and(
      eq(tasks.userId, userId),
      sql`(${tasks.cycleSessionId} = ${cycleSessionId} or ${tasks.cycleAssignment} = 'next')`,
    )).orderBy(desc(tasks.createdAt));
  }

  async moveCurrentTasksToNextCycle(userId: string, cycleSessionId: string, taskIds?: string[]) {
    const filters = [eq(tasks.userId, userId), eq(tasks.cycleSessionId, cycleSessionId), eq(tasks.cycleAssignment, 'current')];

    if (taskIds && taskIds.length > 0) {
      filters.push(inArray(tasks.id, taskIds));
    }

    return this.db.update(tasks).set({
      cycleAssignment: 'next',
      cycleSessionId: null,
      updatedAt: new Date(),
    }).where(and(...filters)).returning();
  }

  async replaceTimeBlocks(sessionId: string, userId: string, blocks: Array<Omit<NewCycleTimeBlock, 'cycleSessionId' | 'userId'>>) {
    return this.db.transaction(async (tx) => {
      await tx.delete(cycleTimeBlocks).where(and(eq(cycleTimeBlocks.cycleSessionId, sessionId), eq(cycleTimeBlocks.userId, userId)));

      if (blocks.length === 0) {
        return [];
      }

      return tx.insert(cycleTimeBlocks).values(blocks.map((block) => ({
        ...block,
        cycleSessionId: sessionId,
        userId,
      }))).returning();
    });
  }

  async upsertPulseRecord(input: NewPulseRecord) {
    const [pulseRecord] = await this.db.insert(pulseRecords).values(input).onConflictDoUpdate({
      target: [pulseRecords.cycleSessionId, pulseRecords.windowKey],
      set: {
        confirmedMinutes: input.confirmedMinutes,
        expiresAt: input.expiresAt,
        firedAt: input.firedAt,
        projectId: input.projectId,
        resolution: input.resolution,
        respondedAt: input.respondedAt,
        reviewedAt: input.reviewedAt,
        status: input.status,
        updatedAt: new Date(),
      },
    }).returning();

    if (!pulseRecord) {
      throw new InternalServerErrorException('Pulse record upsert failed.');
    }

    return pulseRecord;
  }

  async updateCycleSession(id: string, userId: string, input: Partial<NewCycleSession>) {
    const [session] = await this.db.update(cycleSessions).set({
      ...input,
      updatedAt: new Date(),
    }).where(and(eq(cycleSessions.id, id), eq(cycleSessions.userId, userId))).returning();

    if (!session) {
      throw new InternalServerErrorException('Cycle session update failed.');
    }

    return session;
  }
}