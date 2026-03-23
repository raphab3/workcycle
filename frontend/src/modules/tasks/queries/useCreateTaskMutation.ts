'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { taskKeys } from '@/modules/tasks/queries/taskKeys';
import { tasksService } from '@/modules/tasks/services/tasksService';

import type { Task } from '@/modules/tasks/types';

export function useCreateTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tasksService.createTask,
    onSuccess: (task) => {
      queryClient.setQueryData<Task[]>(taskKeys.list(), (currentTasks = []) => [
        task,
        ...currentTasks.filter((currentTask) => currentTask.id !== task.id),
      ]);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: taskKeys.list() });
    },
  });
}