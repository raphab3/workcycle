import assert from 'node:assert/strict';
import test from 'node:test';

import { TasksWriterService } from '@/modules/tasks/services/tasks-writer.service';

test('updateTaskStatus maps the use-case aggregate to the task response DTO', async () => {
  const aggregate = {
    checklistItems: [
      { id: 'item-1', isDone: true, label: 'Rodar em staging', position: 0 },
    ],
    task: {
      columnId: 'done',
      cycleAssignment: 'current',
      cycleSessionId: 'cycle-1',
      description: 'Task concluida no ciclo atual.',
      dueDate: '2026-03-22',
      estimatedHours: 1.5,
      id: 'task-1',
      isArchived: false,
      priority: 'medium',
      projectId: 'project-1',
      status: 'done',
      title: 'Publicar resumo',
      userId: 'user-1',
    },
  };

  const service = new TasksWriterService(
    { createCycleSession: async () => undefined } as never,
    { execute: async () => aggregate } as never,
    { execute: async () => aggregate } as never,
    { execute: async () => aggregate } as never,
    { execute: async () => aggregate } as never,
  );
  const result = await service.updateTaskStatus('task-1', 'user-1', { columnId: 'done' });

  assert.deepEqual(result, {
    checklist: [{ done: true, id: 'item-1', label: 'Rodar em staging', position: 0 }],
    columnId: 'done',
    cycleAssignment: 'current',
    cycleSessionId: 'cycle-1',
    description: 'Task concluida no ciclo atual.',
    dueDate: '2026-03-22',
    estimatedHours: 1.5,
    id: 'task-1',
    isArchived: false,
    priority: 'medium',
    projectId: 'project-1',
    status: 'done',
    title: 'Publicar resumo',
    userId: 'user-1',
  });
});