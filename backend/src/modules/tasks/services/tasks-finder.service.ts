import { Inject, Injectable } from '@nestjs/common';

import { TasksRepository } from '@/modules/tasks/repositories/tasks.repository';
import { ListTasksUseCase } from '@/modules/tasks/use-cases/list-tasks.use-case';
import { toCycleSessionRecord, toTaskRecord } from '@/modules/tasks/types/task';

@Injectable()
export class TasksFinderService {
  constructor(
    @Inject(TasksRepository)
    private readonly tasksRepository: TasksRepository,
    @Inject(ListTasksUseCase)
    private readonly listTasksUseCase: ListTasksUseCase,
  ) {}

  async findCycleSessionByDate(userId: string, cycleDate: string) {
    const session = await this.tasksRepository.findCycleSessionByDate(userId, cycleDate);

    return session ? toCycleSessionRecord(session) : null;
  }

  async findTaskById(id: string, userId: string) {
    const task = await this.tasksRepository.findTaskById(id, userId);

    if (!task) {
      return null;
    }

    const checklist = await this.tasksRepository.listChecklistItems(task.id);

    return toTaskRecord(task, checklist);
  }

  async listTasks(userId: string) {
    const taskRows = await this.listTasksUseCase.execute(userId);

    return Promise.all(taskRows.map(async (task) => {
      const checklist = await this.tasksRepository.listChecklistItems(task.id);

      return toTaskRecord(task, checklist);
    }));
  }
}