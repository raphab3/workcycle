import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq } from 'drizzle-orm';

import { DrizzleService } from '@/shared/database/drizzle.service';
import { projects } from '@/shared/database/schema';

import type { NewProject } from '@/shared/database/schema';

export type ProjectUpdateData = {
  [Key in keyof NewProject]?: Exclude<NewProject[Key], undefined>;
};

@Injectable()
export class ProjectsRepository {
  constructor(
    @Inject(DrizzleService)
    private readonly drizzleService: DrizzleService,
  ) {}

  async listByUserId(userId: string) {
    return this.drizzleService.db
      .select()
      .from(projects)
      .where(eq(projects.userId, userId))
      .orderBy(desc(projects.createdAt));
  }

  async findById(id: string, userId: string) {
    const [project] = await this.drizzleService.db
      .select()
      .from(projects)
      .where(and(eq(projects.id, id), eq(projects.userId, userId)))
      .limit(1);

    return project ?? null;
  }

  async create(input: NewProject) {
    const [project] = await this.drizzleService.db
      .insert(projects)
      .values(input)
      .returning();

    return project;
  }

  async update(id: string, userId: string, data: ProjectUpdateData) {
    const [project] = await this.drizzleService.db
      .update(projects)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(projects.id, id), eq(projects.userId, userId)))
      .returning();

    return project;
  }
}
