import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { projectKeys } from '@/modules/projects/queries/projectKeys';
import { useCreateProjectMutation } from '@/modules/projects/queries/useCreateProjectMutation';
import { useProjectsQuery } from '@/modules/projects/queries/useProjectsQuery';
import { useToggleProjectStatusMutation } from '@/modules/projects/queries/useToggleProjectStatusMutation';
import { useUpdateProjectMutation } from '@/modules/projects/queries/useUpdateProjectMutation';
import { projectsService } from '@/modules/projects/services/projectsService';

import type { Project } from '@/modules/projects/types';

const projectPayload: Project = {
  allocationPct: 40,
  colorHex: '#506169',
  fixedDays: [],
  fixedHoursPerDay: 0,
  id: 'project-1',
  name: 'ClienteCore',
  sprintDays: 14,
  status: 'active',
  type: 'rotative',
};

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('projects queries', () => {
  it('loads the backend project list through useProjectsQuery', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    vi.spyOn(projectsService, 'getProjects').mockResolvedValue([projectPayload]);

    const { result } = renderHook(() => useProjectsQuery(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual([projectPayload]);
  });

  it('updates and invalidates cache after create, update and toggle mutations', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
    queryClient.setQueryData<Project[]>(projectKeys.list(), [projectPayload]);

    vi.spyOn(projectsService, 'createProject').mockResolvedValue({
      ...projectPayload,
      id: 'project-2',
      name: 'ReportPilot',
    });
    vi.spyOn(projectsService, 'updateProject').mockResolvedValue({
      ...projectPayload,
      name: 'ClienteCore Revisto',
    });
    vi.spyOn(projectsService, 'toggleProjectStatus').mockResolvedValue({
      ...projectPayload,
      status: 'paused',
    });

    const createHook = renderHook(() => useCreateProjectMutation(), {
      wrapper: createWrapper(queryClient),
    });
    await createHook.result.current.mutateAsync({
      allocationPct: 10,
      colorHex: '#8B5CF6',
      fixedDays: [],
      fixedHoursPerDay: 0,
      name: 'ReportPilot',
      sprintDays: 14,
      status: 'active',
      type: 'rotative',
    });

    expect(queryClient.getQueryData<Project[]>(projectKeys.list())?.[0]?.id).toBe('project-2');

    const updateHook = renderHook(() => useUpdateProjectMutation(), {
      wrapper: createWrapper(queryClient),
    });
    await updateHook.result.current.mutateAsync({
      projectId: 'project-1',
      values: {
        ...projectPayload,
        name: 'ClienteCore Revisto',
      },
    });

    expect(queryClient.getQueryData<Project[]>(projectKeys.list())?.find((project) => project.id === 'project-1')?.name).toBe('ClienteCore Revisto');

    const toggleHook = renderHook(() => useToggleProjectStatusMutation(), {
      wrapper: createWrapper(queryClient),
    });
    await toggleHook.result.current.mutateAsync({
      projectId: 'project-1',
      status: 'paused',
    });

    expect(queryClient.getQueryData<Project[]>(projectKeys.list())?.find((project) => project.id === 'project-1')?.status).toBe('paused');
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: projectKeys.list() });
  });
});