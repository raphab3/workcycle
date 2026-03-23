'use client';

import { useQuery } from '@tanstack/react-query';

import { taskKeys } from '@/modules/tasks/queries/taskKeys';
import { tasksService } from '@/modules/tasks/services/tasksService';

interface UseTasksQueryOptions {
  enabled?: boolean;
}

export function useTasksQuery({ enabled = true }: UseTasksQueryOptions = {}) {
  return useQuery({
    queryKey: taskKeys.list(),
    queryFn: tasksService.getTasks,
    enabled,
  });
}