import { and, asc, desc, eq } from 'drizzle-orm';
import { Inject, Injectable } from '@nestjs/common';

import { DrizzleService } from '@/shared/database/drizzle.service';
import { cycleSessions, projects, taskChecklistItems, tasks } from '@/shared/database/schema';

import type { AppDatabase } from '@/shared/database/drizzle.service';
import type { NewCycleSession, NewTask, TaskChecklistItem } from '@/shared/database/schema';
import type { TaskChecklistWriteItem } from '@/modules/tasks/types/task';

@Injectable()
export class TasksRepository {
  constructor(@Inject(DrizzleService) private readonly drizzleService: DrizzleService) {}

  private get db(): AppDatabase {
    return this.drizzleService.db;
  }

  async createCycleSession(input: NewCycleSession) {
    const [session] = await this.db.insert(cycleSessions).values(input).returning();

    return session;
  }

  async createTask(input: NewTask, checklist: TaskChecklistWriteItem[] = []) {
    return this.db.transaction(async (tx) => {
      const [task] = await tx.insert(tasks).values(input).returning();

      if (checklist.length === 0 || !task) {
        return { checklistItems: [] as TaskChecklistItem[], task };
      }

      const checklistItems = await tx.insert(taskChecklistItems).values(
        checklist.map((item, index) => ({
          ...item,
          position: item.position ?? index,
          taskId: task.id,
        })),
      ).returning();

      return { checklistItems, task };
    });
  }

  async findCycleSessionByDate(userId: string, cycleDate: string) {
    const [session] = await this.db.select().from(cycleSessions).where(and(eq(cycleSessions.userId, userId), eq(cycleSessions.cycleDate, cycleDate)));

    return session;
  }

  async findCycleSessionById(id: string, userId: string) {
    const [session] = await this.db.select().from(cycleSessions).where(and(eq(cycleSessions.id, id), eq(cycleSessions.userId, userId))).limit(1);

    return session ?? null;
  }

  async findProjectById(id: string, userId: string) {
    const [project] = await this.db.select().from(projects).where(and(eq(projects.id, id), eq(projects.userId, userId))).limit(1);

    return project ?? null;
  }

  async findTaskById(id: string, userId: string) {
    const [task] = await this.db.select().from(tasks).where(and(eq(tasks.id, id), eq(tasks.userId, userId)));

    return task;
  }

  async listChecklistItems(taskId: string) {
    return this.db.select().from(taskChecklistItems).where(eq(taskChecklistItems.taskId, taskId)).orderBy(asc(taskChecklistItems.position));
  }

  async listTasks(userId: string, includeArchived = false) {
    if (includeArchived) {
      return this.db.select().from(tasks).where(eq(tasks.userId, userId)).orderBy(desc(tasks.createdAt));
    }

    return this.db.select().from(tasks).where(and(eq(tasks.userId, userId), eq(tasks.isArchived, false))).orderBy(desc(tasks.createdAt));
  }

  async replaceChecklist(taskId: string, checklist: TaskChecklistWriteItem[]) {
    return this.db.transaction(async (tx) => {
      await tx.delete(taskChecklistItems).where(eq(taskChecklistItems.taskId, taskId));

      if (checklist.length === 0) {
        return [] as TaskChecklistItem[];
      }

      return tx.insert(taskChecklistItems).values(
        checklist.map((item, index) => ({
          ...item,
          position: item.position ?? index,
          taskId,
        })),
      ).returning();
    });
  }

  async updateTask(id: string, userId: string, input: Partial<NewTask>) {
    const [task] = await this.db
      .update(tasks)
      .set({ ...input, updatedAt: new Date() })
      .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
      .returning();

    return task;
  }
}