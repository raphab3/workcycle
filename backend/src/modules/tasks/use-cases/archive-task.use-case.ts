import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { TasksRepository } from '@/modules/tasks/repositories/tasks.repository';
import { toTaskPersistenceAggregate } from '@/modules/tasks/types/task';

@Injectable()
export class ArchiveTaskUseCase {
  constructor(
    @Inject(TasksRepository)
    private readonly tasksRepository: TasksRepository,
  ) {}

  async execute(id: string, userId: string) {
    const existing = await this.tasksRepository.findTaskById(id, userId);

    if (!existing) {
      throw new NotFoundException('Task not found.');
    }

    const task = existing.isArchived
      ? existing
      : await this.tasksRepository.updateTask(id, userId, { isArchived: true });
    const checklistItems = await this.tasksRepository.listChecklistItems(id);

    return toTaskPersistenceAggregate(task as NonNullable<typeof task>, checklistItems);
  }
}