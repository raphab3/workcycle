import assert from 'node:assert/strict';
import test from 'node:test';

import { createTaskSchema, updateTaskSchema, updateTaskStatusSchema } from '@/modules/tasks/tasks.schemas';

test('createTaskSchema accepts a board-consistent payload', () => {
  const parsed = createTaskSchema.parse({
    checklist: [
      { done: false, id: 'tmp-1', label: 'Revisar indexes' },
    ],
    columnId: 'in-progress',
    cycleAssignment: 'current',
    cycleSessionId: '9f5ad31c-1ece-451c-a75f-316ab1cd9369',
    description: 'Fechar a migration principal antes da janela de deploy.',
    dueDate: '2026-03-25',
    estimatedHours: 3.5,
    priority: 'critical',
    projectId: '62b2ed6d-60e8-4ef4-8123-1cda1f31df7a',
    status: 'doing',
    title: 'Ajustar migration de faturamento',
  });

  assert.equal(parsed.status, 'doing');
  assert.equal(parsed.cycleSessionId, '9f5ad31c-1ece-451c-a75f-316ab1cd9369');
});

test('updateTaskSchema rejects empty updates', () => {
  assert.throws(() => updateTaskSchema.parse({}), /At least one task field must be provided for update\./);
});

test('updateTaskStatusSchema rejects inconsistent column and status combinations', () => {
  assert.throws(() => updateTaskStatusSchema.parse({ columnId: 'done', status: 'doing' }), /Task status must match the selected board column \(done\)\./);
});

test('createTaskSchema requires a cycle session for current-cycle tasks', () => {
  assert.throws(() => createTaskSchema.parse({
    checklist: [],
    columnId: 'backlog',
    cycleAssignment: 'current',
    cycleSessionId: null,
    description: 'Registrar as validacoes restantes da task antes do handoff.',
    dueDate: null,
    estimatedHours: 2,
    priority: 'high',
    projectId: '62b2ed6d-60e8-4ef4-8123-1cda1f31df7a',
    status: 'todo',
    title: 'Preparar handoff tecnico',
  }), /Tasks in the current cycle must reference a concrete cycle session\./);
});