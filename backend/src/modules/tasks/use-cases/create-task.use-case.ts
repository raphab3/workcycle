import { Inject, Injectable } from '@nestjs/common';

import { TasksRepository } from '@/modules/tasks/repositories/tasks.repository';
import { ValidateTaskWriteContextUseCase } from '@/modules/tasks/use-cases/validate-task-write-context.use-case';
import { toTaskPersistenceAggregate } from '@/modules/tasks/types/task';

import type { CreateTaskInput } from '@/modules/tasks/tasks.schemas';
import type { TaskChecklistWriteItem } from '@/modules/tasks/types/task';

function toChecklistWriteItems(checklist: CreateTaskInput['checklist']): TaskChecklistWriteItem[] {
  return checklist.map((item, index) => ({
    isDone: item.done,
    label: item.label,
    position: index,
  }));
}

@Injectable()
export class CreateTaskUseCase {
  constructor(
    @Inject(TasksRepository)
    private readonly tasksRepository: TasksRepository,
    @Inject(ValidateTaskWriteContextUseCase)
    private readonly validateTaskWriteContextUseCase: ValidateTaskWriteContextUseCase,
  ) {}

  async execute(userId: string, input: CreateTaskInput) {
    const validated = await this.validateTaskWriteContextUseCase.execute(userId, {
      columnId: input.columnId,
      cycleAssignment: input.cycleAssignment,
      cycleSessionId: input.cycleSessionId,
      projectId: input.projectId,
      status: input.status,
    });

    const { task, checklistItems } = await this.tasksRepository.createTask({
      columnId: validated.columnId,
      cycleAssignment: validated.cycleAssignment,
      cycleSessionId: validated.cycleSessionId,
      description: input.description,
      dueDate: input.dueDate,
      estimatedHours: input.estimatedHours,
      priority: input.priority,
      projectId: validated.projectId,
      status: validated.status,
      title: input.title,
      userId,
    }, toChecklistWriteItems(input.checklist));

    return toTaskPersistenceAggregate(task as NonNullable<typeof task>, checklistItems);
  }
}