import assert from 'node:assert/strict';
import test from 'node:test';

import { BadRequestException } from '@nestjs/common';

import { ValidateTaskWriteContextUseCase } from '@/modules/tasks/use-cases/validate-task-write-context.use-case';

test('validates project ownership and current-cycle linkage', async () => {
  const useCase = new ValidateTaskWriteContextUseCase({
    findCycleSessionById: async () => ({ activeProjectId: 'project-1' }),
    findProjectById: async () => ({ id: 'project-1' }),
  } as never);

  const result = await useCase.execute('user-1', {
    columnId: 'in-progress',
    cycleAssignment: 'current',
    cycleSessionId: 'cycle-1',
    projectId: 'project-1',
    status: 'doing',
  });

  assert.deepEqual(result, {
    columnId: 'in-progress',
    cycleAssignment: 'current',
    cycleSessionId: 'cycle-1',
    projectId: 'project-1',
    status: 'doing',
  });
});

test('rejects tasks associated with a project from another user', async () => {
  const useCase = new ValidateTaskWriteContextUseCase({
    findProjectById: async () => null,
  } as never);

  await assert.rejects(() => useCase.execute('user-1', {
    columnId: 'backlog',
    cycleAssignment: 'backlog',
    cycleSessionId: null,
    projectId: 'project-2',
    status: 'todo',
  }), (error: unknown) => error instanceof BadRequestException && error.message === 'Task project is invalid for the authenticated user.');
});

test('rejects a cycle session linked to a different active project', async () => {
  const useCase = new ValidateTaskWriteContextUseCase({
    findCycleSessionById: async () => ({ activeProjectId: 'project-2' }),
    findProjectById: async () => ({ id: 'project-1' }),
  } as never);

  await assert.rejects(() => useCase.execute('user-1', {
    columnId: 'in-progress',
    cycleAssignment: 'current',
    cycleSessionId: 'cycle-1',
    projectId: 'project-1',
    status: 'doing',
  }), (error: unknown) => error instanceof BadRequestException && error.message === 'Task project must match the active project of the selected cycle session.');
});