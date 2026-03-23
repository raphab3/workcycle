import { beforeEach, describe, expect, it, vi } from 'vitest';

import { api } from '@/lib/axios';

import { tasksService } from './tasksService';

const taskRecordPayload = {
  checklist: [
    { done: true, id: 'check-1', label: 'Revisar indexes', position: 0 },
  ],
  columnId: 'backlog',
  cycleAssignment: 'current',
  cycleSessionId: 'cycle-2026-03-22',
  description: 'Fechar a migration principal do faturamento, revisar indexes e validar o impacto nas consultas legadas antes do deploy.',
  dueDate: '2026-03-22',
  estimatedHours: 3.5,
  id: 'billing-migration',
  isArchived: false,
  priority: 'critical',
  projectId: 'datavault',
  status: 'todo',
  title: 'Ajustar migration de faturamento',
  userId: 'user-1',
} as const;

describe('tasksService', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 2, 22, 10, 0, 0));
  });

  it('requests the authenticated tasks list and maps persisted records', async () => {
    const getSpy = vi.spyOn(api, 'get').mockResolvedValue({
      data: [taskRecordPayload],
    });

    const result = await tasksService.getTasks();

    expect(getSpy).toHaveBeenCalledWith('/api/tasks');
    expect(result).toEqual([
      expect.objectContaining({
        checklist: [{ done: true, id: 'check-1', label: 'Revisar indexes' }],
        cycleSessionId: 'cycle-2026-03-22',
        dueDate: '2026-03-22',
        dueInDays: 0,
        id: 'billing-migration',
      }),
    ]);

    getSpy.mockRestore();
  });

  it('posts a persisted task payload converted from form values', async () => {
    const postSpy = vi.spyOn(api, 'post').mockResolvedValue({
      data: taskRecordPayload,
    });

    const result = await tasksService.createTask({
      checklist: [{ done: false, id: '', label: 'Rodar em staging' }],
      columnId: 'backlog',
      cycleAssignment: 'backlog',
      cycleSessionId: null,
      description: 'Fechar a migration principal do faturamento, revisar indexes e validar o impacto nas consultas legadas antes do deploy.',
      dueInDays: 2,
      estimatedHours: 3.5,
      priority: 'critical',
      projectId: 'datavault',
      status: 'todo',
      title: 'Ajustar migration de faturamento',
    });

    expect(postSpy).toHaveBeenCalledWith('/api/tasks', {
      checklist: [{ done: false, label: 'Rodar em staging' }],
      columnId: 'backlog',
      cycleAssignment: 'backlog',
      cycleSessionId: null,
      description: 'Fechar a migration principal do faturamento, revisar indexes e validar o impacto nas consultas legadas antes do deploy.',
      dueDate: '2026-03-24',
      estimatedHours: 3.5,
      priority: 'critical',
      projectId: 'datavault',
      status: 'todo',
      title: 'Ajustar migration de faturamento',
    });
    expect(result.id).toBe('billing-migration');

    postSpy.mockRestore();
  });

  it('patches task status operations against the backend endpoints', async () => {
    const patchSpy = vi.spyOn(api, 'patch').mockResolvedValue({
      data: {
        ...taskRecordPayload,
        columnId: 'done',
        status: 'done',
      },
    });

    const statusResult = await tasksService.updateTaskStatus({
      taskId: 'billing-migration',
      columnId: 'done',
      cycleAssignment: 'current',
      cycleSessionId: 'cycle-2026-03-22',
      status: 'done',
    });

    expect(patchSpy).toHaveBeenNthCalledWith(1, '/api/tasks/billing-migration/status', {
      columnId: 'done',
      cycleAssignment: 'current',
      cycleSessionId: 'cycle-2026-03-22',
      status: 'done',
    });
    expect(statusResult.status).toBe('done');

    await tasksService.archiveTask({ taskId: 'billing-migration' });

    expect(patchSpy).toHaveBeenNthCalledWith(2, '/api/tasks/billing-migration/archive', {});

    patchSpy.mockRestore();
  });
});