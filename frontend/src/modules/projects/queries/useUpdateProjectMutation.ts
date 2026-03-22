'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { projectKeys } from '@/modules/projects/queries/projectKeys';
import { projectsService } from '@/modules/projects/services/projectsService';

import type { Project } from '@/modules/projects/types';

export function useUpdateProjectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: projectsService.updateProject,
    onSuccess: (project) => {
      queryClient.setQueryData<Project[]>(projectKeys.list(), (currentProjects = []) => currentProjects.map((currentProject) => (
        currentProject.id === project.id ? project : currentProject
      )));
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: projectKeys.list() });
    },
  });
}