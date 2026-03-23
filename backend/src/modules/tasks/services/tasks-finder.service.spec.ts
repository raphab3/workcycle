import assert from 'node:assert/strict';
import test from 'node:test';

import { TasksFinderService } from '@/modules/tasks/services/tasks-finder.service';

test('listTasks maps persisted tasks and checklist rows to the public response contract', async () => {
  const tasksRepository = {
    listChecklistItems: async () => [
      { id: 'item-1', isDone: false, label: 'Revisar indexes', position: 0 },
    ],
  };
  const listTasksUseCase = {
    execute: async () => [
      {
        columnId: 'backlog',
        cycleAssignment: 'backlog',
        cycleSessionId: null,
        description: 'Fechar pontos restantes antes da entrega.',
        dueDate: '2026-03-25',
        estimatedHours: 2,
        id: 'task-1',
        isArchived: false,
        priority: 'high',
        projectId: 'project-1',
        status: 'todo',
        title: 'Preparar handoff',
        userId: 'user-1',
      },
    ],
  };

  const service = new TasksFinderService(tasksRepository as never, listTasksUseCase as never);
  const result = await service.listTasks('user-1');

  assert.deepEqual(result, [{
    checklist: [{ done: false, id: 'item-1', label: 'Revisar indexes', position: 0 }],
    columnId: 'backlog',
    cycleAssignment: 'backlog',
    cycleSessionId: null,
    description: 'Fechar pontos restantes antes da entrega.',
    dueDate: '2026-03-25',
    estimatedHours: 2,
    id: 'task-1',
    isArchived: false,
    priority: 'high',
    projectId: 'project-1',
    status: 'todo',
    title: 'Preparar handoff',
    userId: 'user-1',
  }]);
});