import assert from 'node:assert/strict';
import test from 'node:test';

import { getTableColumns } from 'drizzle-orm';

import { cycleSessionStateEnum, cycleSessions, taskBoardColumnEnum, taskChecklistItems, taskCycleAssignmentEnum, taskPriorityEnum, taskStatusEnum, tasks } from '@/shared/database/schema';

test('tasks schema exposes the persistence fields required by the integration plan', () => {
  const columns = getTableColumns(tasks);

  assert.ok(columns.userId);
  assert.ok(columns.projectId);
  assert.ok(columns.cycleSessionId);
  assert.ok(columns.columnId);
  assert.ok(columns.priority);
  assert.ok(columns.status);
  assert.ok(columns.cycleAssignment);
  assert.ok(columns.estimatedHours);
  assert.ok(columns.dueDate);
  assert.ok(columns.isArchived);
});

test('task persistence enums stay aligned with the approved board and cycle model', () => {
  assert.deepEqual(taskPriorityEnum.enumValues, ['critical', 'high', 'medium', 'low']);
  assert.deepEqual(taskStatusEnum.enumValues, ['todo', 'doing', 'blocked', 'done']);
  assert.deepEqual(taskCycleAssignmentEnum.enumValues, ['backlog', 'current', 'next']);
  assert.deepEqual(taskBoardColumnEnum.enumValues, ['backlog', 'in-progress', 'code-review', 'done']);
  assert.deepEqual(cycleSessionStateEnum.enumValues, ['idle', 'running', 'paused_manual', 'paused_inactivity', 'completed']);
});

test('cycle sessions and checklist tables model the concrete day link and persisted checklist structure', () => {
  const cycleSessionColumns = getTableColumns(cycleSessions);
  const checklistColumns = getTableColumns(taskChecklistItems);

  assert.ok(cycleSessionColumns.cycleDate);
  assert.ok(cycleSessionColumns.state);
  assert.ok(cycleSessionColumns.activeProjectId);
  assert.ok(checklistColumns.taskId);
  assert.ok(checklistColumns.position);
  assert.ok(checklistColumns.isDone);
});