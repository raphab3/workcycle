import { Inject, Injectable } from '@nestjs/common';

import { TasksRepository } from '@/modules/tasks/repositories/tasks.repository';

@Injectable()
export class ListTasksUseCase {
  constructor(
    @Inject(TasksRepository)
    private readonly tasksRepository: TasksRepository,
  ) {}

  async execute(userId: string) {
    return this.tasksRepository.listTasks(userId);
  }
}