import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { TasksRepository } from '@/modules/tasks/repositories/tasks.repository';
import { getTaskStatusForColumn } from '@/modules/tasks/types/task';

import type { TaskBoardColumnId, TaskCycleAssignment, TaskStatus } from '@/modules/tasks/types/task';

export interface TaskWriteContextInput {
  columnId: TaskBoardColumnId;
  cycleAssignment: TaskCycleAssignment;
  cycleSessionId: string | null;
  projectId: string;
  status: TaskStatus;
}

export type TaskWriteContextResult = TaskWriteContextInput;

@Injectable()
export class ValidateTaskWriteContextUseCase {
  constructor(
    @Inject(TasksRepository)
    private readonly tasksRepository: TasksRepository,
  ) {}

  async execute(userId: string, input: TaskWriteContextInput): Promise<TaskWriteContextResult> {
    const expectedStatus = getTaskStatusForColumn(input.columnId);

    if (input.status !== expectedStatus) {
      throw new BadRequestException(`Task status must match the selected board column (${expectedStatus}).`);
    }

    if (input.cycleAssignment === 'current' && !input.cycleSessionId) {
      throw new BadRequestException('Tasks in the current cycle must reference a concrete cycle session.');
    }

    if (input.cycleAssignment !== 'current' && input.cycleSessionId) {
      throw new BadRequestException('Only current-cycle tasks may reference a concrete cycle session.');
    }

    const project = await this.tasksRepository.findProjectById(input.projectId, userId);

    if (!project) {
      throw new BadRequestException('Task project is invalid for the authenticated user.');
    }

    if (input.cycleSessionId) {
      const session = await this.tasksRepository.findCycleSessionById(input.cycleSessionId, userId);

      if (!session) {
        throw new BadRequestException('Task cycle session is invalid for the authenticated user.');
      }

      if (session.activeProjectId && session.activeProjectId !== input.projectId) {
        throw new BadRequestException('Task project must match the active project of the selected cycle session.');
      }
    }

    return {
      columnId: input.columnId,
      cycleAssignment: input.cycleAssignment,
      cycleSessionId: input.cycleAssignment === 'current' ? input.cycleSessionId : null,
      projectId: input.projectId,
      status: expectedStatus,
    };
  }
}