'use client';

import { useQuery } from '@tanstack/react-query';

import { projectKeys } from '@/modules/projects/queries/projectKeys';
import { projectsService } from '@/modules/projects/services/projectsService';

interface UseProjectsQueryOptions {
  enabled?: boolean;
}

export function useProjectsQuery({ enabled = true }: UseProjectsQueryOptions = {}) {
  return useQuery({
    queryKey: projectKeys.list(),
    queryFn: projectsService.getProjects,
    enabled,
  });
}