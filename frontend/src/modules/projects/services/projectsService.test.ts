import { describe, expect, it, vi } from 'vitest';

import { api } from '@/lib/axios';

import { projectsService } from './projectsService';

const projectPayload = {
  allocationPct: 40,
  colorHex: '#506169',
  fixedDays: [],
  fixedHoursPerDay: 0,
  id: 'project-1',
  name: 'ClienteCore',
  sprintDays: 14,
  status: 'active',
  type: 'rotative',
} as const;

describe('projectsService', () => {
  it('requests the authenticated projects list', async () => {
    const getSpy = vi.spyOn(api, 'get').mockResolvedValue({
      data: [projectPayload],
    });

    const result = await projectsService.getProjects();

    expect(getSpy).toHaveBeenCalledWith('/api/projects');
    expect(result).toHaveLength(1);

    getSpy.mockRestore();
  });

  it('posts a project payload to create a new project', async () => {
    const postSpy = vi.spyOn(api, 'post').mockResolvedValue({
      data: projectPayload,
    });

    const result = await projectsService.createProject({
      allocationPct: 40,
      colorHex: '#506169',
      fixedDays: [],
      fixedHoursPerDay: 0,
      name: 'ClienteCore',
      sprintDays: 14,
      status: 'active',
      type: 'rotative',
    });

    expect(postSpy).toHaveBeenCalledWith('/api/projects', {
      allocationPct: 40,
      colorHex: '#506169',
      fixedDays: [],
      fixedHoursPerDay: 0,
      name: 'ClienteCore',
      sprintDays: 14,
      status: 'active',
      type: 'rotative',
    });
    expect(result).toEqual(projectPayload);

    postSpy.mockRestore();
  });

  it('patches a project payload when updating a project', async () => {
    const patchSpy = vi.spyOn(api, 'patch').mockResolvedValue({
      data: {
        ...projectPayload,
        name: 'ClienteCore Revisto',
      },
    });

    const result = await projectsService.updateProject({
      projectId: 'project-1',
      values: {
        allocationPct: 40,
        colorHex: '#506169',
        fixedDays: [],
        fixedHoursPerDay: 0,
        name: 'ClienteCore Revisto',
        sprintDays: 14,
        status: 'active',
        type: 'rotative',
      },
    });

    expect(patchSpy).toHaveBeenCalledWith('/api/projects/project-1', {
      allocationPct: 40,
      colorHex: '#506169',
      fixedDays: [],
      fixedHoursPerDay: 0,
      name: 'ClienteCore Revisto',
      sprintDays: 14,
      status: 'active',
      type: 'rotative',
    });
    expect(result.name).toBe('ClienteCore Revisto');

    patchSpy.mockRestore();
  });

  it('sends the target status when toggling a project', async () => {
    const patchSpy = vi.spyOn(api, 'patch').mockResolvedValue({
      data: {
        ...projectPayload,
        status: 'paused',
      },
    });

    const result = await projectsService.toggleProjectStatus({ projectId: 'project-1', status: 'paused' });

    expect(patchSpy).toHaveBeenCalledWith('/api/projects/project-1/status', { status: 'paused' });
    expect(result.status).toBe('paused');

    patchSpy.mockRestore();
  });
});