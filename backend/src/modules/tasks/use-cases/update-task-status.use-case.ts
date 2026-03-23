import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';

import { TasksRepository } from '@/modules/tasks/repositories/tasks.repository';
import { ValidateTaskWriteContextUseCase } from '@/modules/tasks/use-cases/validate-task-write-context.use-case';
import { toTaskPersistenceAggregate } from '@/modules/tasks/types/task';

import type { UpdateTaskStatusInput } from '@/modules/tasks/tasks.schemas';

function selectNextValue<T>(value: T | undefined, fallback: T): T {
  return value === undefined ? fallback : value;
}

@Injectable()
export class UpdateTaskStatusUseCase {
  constructor(
    @Inject(TasksRepository)
    private readonly tasksRepository: TasksRepository,
    @Inject(ValidateTaskWriteContextUseCase)
    private readonly validateTaskWriteContextUseCase: ValidateTaskWriteContextUseCase,
  ) {}

  async execute(id: string, userId: string, input: UpdateTaskStatusInput) {
    const existing = await this.tasksRepository.findTaskById(id, userId);

    if (!existing) {
      throw new NotFoundException('Task not found.');
    }

    if (existing.isArchived) {
      throw new ConflictException('Archived tasks cannot return to the board without an explicit restore rule.');
    }

    const validated = await this.validateTaskWriteContextUseCase.execute(userId, {
      columnId: selectNextValue(input.columnId, existing.columnId),
      cycleAssignment: selectNextValue(input.cycleAssignment, existing.cycleAssignment),
      cycleSessionId: selectNextValue(input.cycleSessionId, existing.cycleSessionId),
      projectId: existing.projectId,
      status: selectNextValue(input.status, existing.status),
    });

    const task = await this.tasksRepository.updateTask(id, userId, {
      columnId: validated.columnId,
      cycleAssignment: validated.cycleAssignment,
      cycleSessionId: validated.cycleSessionId,
      status: validated.status,
    });
    const checklistItems = await this.tasksRepository.listChecklistItems(id);

    return toTaskPersistenceAggregate(task as NonNullable<typeof task>, checklistItems);
  }
}