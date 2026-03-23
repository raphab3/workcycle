import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { taskKeys } from '@/modules/tasks/queries/taskKeys';
import { useArchiveTaskMutation } from '@/modules/tasks/queries/useArchiveTaskMutation';
import { useCreateTaskMutation } from '@/modules/tasks/queries/useCreateTaskMutation';
import { useTasksQuery } from '@/modules/tasks/queries/useTasksQuery';
import { useUpdateTaskMutation } from '@/modules/tasks/queries/useUpdateTaskMutation';
import { useUpdateTaskStatusMutation } from '@/modules/tasks/queries/useUpdateTaskStatusMutation';
import { tasksService } from '@/modules/tasks/services/tasksService';

import type { Task } from '@/modules/tasks/types';

const taskPayload: Task = {
  checklist: [{ done: true, id: 'check-1', label: 'Revisar indexes' }],
  columnId: 'backlog',
  cycleAssignment: 'current',
  cycleSessionId: 'cycle-2026-03-22',
  description: 'Fechar a migration principal do faturamento, revisar indexes e validar o impacto nas consultas legadas antes do deploy.',
  dueDate: '2026-03-22',
  dueInDays: 0,
  estimatedHours: 3.5,
  id: 'billing-migration',
  isArchived: false,
  priority: 'critical',
  projectId: 'datavault',
  status: 'todo',
  title: 'Ajustar migration de faturamento',
};

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('tasks queries', () => {
  it('loads the backend tasks list through useTasksQuery', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    vi.spyOn(tasksService, 'getTasks').mockResolvedValue([taskPayload]);

    const { result } = renderHook(() => useTasksQuery(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual([taskPayload]);
  });

  it('updates and invalidates cache after create, update, status and archive mutations', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
    queryClient.setQueryData<Task[]>(taskKeys.list(), [taskPayload]);

    vi.spyOn(tasksService, 'createTask').mockResolvedValue({
      ...taskPayload,
      id: 'task-2',
      title: 'Preparar handoff do projeto',
    });
    vi.spyOn(tasksService, 'updateTask').mockResolvedValue({
      ...taskPayload,
      title: 'Ajustar migration de faturamento v2',
    });
    vi.spyOn(tasksService, 'updateTaskStatus').mockResolvedValue({
      ...taskPayload,
      columnId: 'done',
      status: 'done',
    });
    vi.spyOn(tasksService, 'archiveTask').mockResolvedValue({
      ...taskPayload,
      isArchived: true,
    });

    const createHook = renderHook(() => useCreateTaskMutation(), {
      wrapper: createWrapper(queryClient),
    });
    await createHook.result.current.mutateAsync({
      checklist: [],
      columnId: 'backlog',
      cycleAssignment: 'backlog',
      cycleSessionId: null,
      description: 'Consolidar contexto, checklist e pontos de transicao antes do handoff para o time.',
      dueInDays: 2,
      estimatedHours: 2,
      priority: 'high',
      projectId: 'fintrack',
      status: 'todo',
      title: 'Preparar handoff do projeto',
    });

    expect(queryClient.getQueryData<Task[]>(taskKeys.list())?.[0]?.id).toBe('task-2');

    const updateHook = renderHook(() => useUpdateTaskMutation(), {
      wrapper: createWrapper(queryClient),
    });
    await updateHook.result.current.mutateAsync({
      taskId: 'billing-migration',
      values: {
        checklist: taskPayload.checklist,
        columnId: 'backlog',
        cycleAssignment: 'current',
        cycleSessionId: 'cycle-2026-03-22',
        description: taskPayload.description,
        dueInDays: 0,
        estimatedHours: 3.5,
        priority: 'critical',
        projectId: 'datavault',
        status: 'todo',
        title: 'Ajustar migration de faturamento v2',
      },
    });

    expect(queryClient.getQueryData<Task[]>(taskKeys.list())?.find((task) => task.id === 'billing-migration')?.title).toBe('Ajustar migration de faturamento v2');

    const statusHook = renderHook(() => useUpdateTaskStatusMutation(), {
      wrapper: createWrapper(queryClient),
    });
    await statusHook.result.current.mutateAsync({
      taskId: 'billing-migration',
      columnId: 'done',
      cycleAssignment: 'current',
      cycleSessionId: 'cycle-2026-03-22',
      status: 'done',
    });

    expect(queryClient.getQueryData<Task[]>(taskKeys.list())?.find((task) => task.id === 'billing-migration')?.status).toBe('done');

    const archiveHook = renderHook(() => useArchiveTaskMutation(), {
      wrapper: createWrapper(queryClient),
    });
    await archiveHook.result.current.mutateAsync({ taskId: 'billing-migration' });

    expect(queryClient.getQueryData<Task[]>(taskKeys.list())?.find((task) => task.id === 'billing-migration')?.isArchived).toBe(true);
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: taskKeys.list() });
  });
});