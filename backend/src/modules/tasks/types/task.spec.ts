import assert from 'node:assert/strict';
import test from 'node:test';

import { TASK_BOARD_COLUMNS, toCycleSessionRecord, toTaskRecord } from '@/modules/tasks/types/task';

test('TASK_BOARD_COLUMNS keeps the board fixed in the approved order', () => {
  assert.deepEqual(TASK_BOARD_COLUMNS, [
    { id: 'backlog', order: 0, status: 'todo', title: 'Backlog' },
    { id: 'in-progress', order: 1, status: 'doing', title: 'In Progress' },
    { id: 'code-review', order: 2, status: 'blocked', title: 'Code Review' },
    { id: 'done', order: 3, status: 'done', title: 'Done' },
  ]);
});

test('toTaskRecord maps persistence rows plus checklist to the task contract', () => {
  const taskRecord = toTaskRecord({
    columnId: 'in-progress',
    createdAt: new Date('2026-03-22T10:00:00.000Z'),
    cycleAssignment: 'current',
    cycleSessionId: 'cycle-1',
    description: 'Fechar a migration principal antes do deploy.',
    dueDate: '2026-03-23',
    estimatedHours: 3.5,
    id: 'task-1',
    isArchived: false,
    priority: 'critical',
    projectId: 'project-1',
    status: 'doing',
    title: 'Ajustar migration de faturamento',
    updatedAt: new Date('2026-03-22T10:30:00.000Z'),
    userId: 'user-1',
  }, [
    {
      createdAt: new Date('2026-03-22T10:00:00.000Z'),
      id: 'item-2',
      isDone: false,
      label: 'Rodar em staging',
      position: 1,
      taskId: 'task-1',
      updatedAt: new Date('2026-03-22T10:10:00.000Z'),
    },
    {
      createdAt: new Date('2026-03-22T10:00:00.000Z'),
      id: 'item-1',
      isDone: true,
      label: 'Revisar indexes',
      position: 0,
      taskId: 'task-1',
      updatedAt: new Date('2026-03-22T10:05:00.000Z'),
    },
  ]);

  assert.deepEqual(taskRecord, {
    checklist: [
      { done: true, id: 'item-1', label: 'Revisar indexes', position: 0 },
      { done: false, id: 'item-2', label: 'Rodar em staging', position: 1 },
    ],
    columnId: 'in-progress',
    cycleAssignment: 'current',
    cycleSessionId: 'cycle-1',
    description: 'Fechar a migration principal antes do deploy.',
    dueDate: '2026-03-23',
    estimatedHours: 3.5,
    id: 'task-1',
    isArchived: false,
    priority: 'critical',
    projectId: 'project-1',
    status: 'doing',
    title: 'Ajustar migration de faturamento',
    userId: 'user-1',
  });
});

test('toCycleSessionRecord exposes the concrete daily cycle link for tasks', () => {
  const sessionRecord = toCycleSessionRecord({
    activeProjectId: 'project-1',
    closedAt: new Date('2026-03-22T18:00:00.000Z'),
    createdAt: new Date('2026-03-22T08:00:00.000Z'),
    cycleDate: '2026-03-22',
    id: 'cycle-1',
    previousCycleDate: null,
    rolloverNoticeDescription: null,
    rolloverNoticeTitle: null,
    rolloverStrategy: 'manual-start-next',
    rolloverTriggeredAt: null,
    snapshot: null,
    startedAt: new Date('2026-03-22T09:00:00.000Z'),
    state: 'running',
    updatedAt: new Date('2026-03-22T09:30:00.000Z'),
    userId: 'user-1',
  });

  assert.deepEqual(sessionRecord, {
    activeProjectId: 'project-1',
    closedAt: '2026-03-22T18:00:00.000Z',
    cycleDate: '2026-03-22',
    id: 'cycle-1',
    startedAt: '2026-03-22T09:00:00.000Z',
    state: 'running',
    userId: 'user-1',
  });
});