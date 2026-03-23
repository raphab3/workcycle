import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';

import { TasksRepository } from '@/modules/tasks/repositories/tasks.repository';
import { ArchiveTaskUseCase } from '@/modules/tasks/use-cases/archive-task.use-case';
import { CreateTaskUseCase } from '@/modules/tasks/use-cases/create-task.use-case';
import { UpdateTaskStatusUseCase } from '@/modules/tasks/use-cases/update-task-status.use-case';
import { UpdateTaskUseCase } from '@/modules/tasks/use-cases/update-task.use-case';
import { toCycleSessionRecord, toTaskRecord } from '@/modules/tasks/types/task';

import type { CreateTaskInput, UpdateTaskInput, UpdateTaskStatusInput } from '@/modules/tasks/tasks.schemas';
import type { NewCycleSession } from '@/shared/database/schema';

function ensurePersisted<T>(value: T | undefined, entity: 'cycleSession' | 'task') {
  if (!value) {
    throw new InternalServerErrorException(`Expected persisted ${entity} entity.`);
  }

  return value;
}

@Injectable()
export class TasksWriterService {
  constructor(
    @Inject(TasksRepository)
    private readonly tasksRepository: TasksRepository,
    @Inject(ArchiveTaskUseCase)
    private readonly archiveTaskUseCase: ArchiveTaskUseCase,
    @Inject(CreateTaskUseCase)
    private readonly createTaskUseCase: CreateTaskUseCase,
    @Inject(UpdateTaskStatusUseCase)
    private readonly updateTaskStatusUseCase: UpdateTaskStatusUseCase,
    @Inject(UpdateTaskUseCase)
    private readonly updateTaskUseCase: UpdateTaskUseCase,
  ) {}

  async createCycleSession(input: NewCycleSession) {
    const session = ensurePersisted(await this.tasksRepository.createCycleSession(input), 'cycleSession');

    return toCycleSessionRecord(session);
  }

  async archiveTask(id: string, userId: string) {
    const aggregate = await this.archiveTaskUseCase.execute(id, userId);

    return toTaskRecord(aggregate.task, aggregate.checklistItems);
  }

  async createTask(userId: string, input: CreateTaskInput) {
    const aggregate = await this.createTaskUseCase.execute(userId, input);

    return toTaskRecord(aggregate.task, aggregate.checklistItems);
  }

  async updateTask(id: string, userId: string, input: UpdateTaskInput) {
    const aggregate = await this.updateTaskUseCase.execute(id, userId, input);

    return toTaskRecord(aggregate.task, aggregate.checklistItems);
  }

  async updateTaskStatus(id: string, userId: string, input: UpdateTaskStatusInput) {
    const aggregate = await this.updateTaskStatusUseCase.execute(id, userId, input);

    return toTaskRecord(aggregate.task, aggregate.checklistItems);
  }
}