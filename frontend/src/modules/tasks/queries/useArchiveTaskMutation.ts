'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { taskKeys } from '@/modules/tasks/queries/taskKeys';
import { tasksService } from '@/modules/tasks/services/tasksService';

import type { Task } from '@/modules/tasks/types';

export function useArchiveTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tasksService.archiveTask,
    onSuccess: (task) => {
      queryClient.setQueryData<Task[]>(taskKeys.list(), (currentTasks = []) => currentTasks.map((currentTask) => (
        currentTask.id === task.id ? task : currentTask
      )));
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: taskKeys.list() });
    },
  });
}