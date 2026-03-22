import { vi } from 'vitest';

import { api } from '@/lib/axios';

import { projectsService } from './projectsService';

describe('projectsService', () => {
  it('requests the authenticated projects list', async () => {
    const getSpy = vi.spyOn(api, 'get').mockResolvedValue({
      data: [
        {
          allocationPct: 40,
          colorHex: '#506169',
          fixedDays: [],
          fixedHoursPerDay: 0,
          id: 'project-1',
          name: 'ClienteCore',
          sprintDays: 14,
          status: 'active',
          type: 'rotative',
        },
      ],
    });

    const result = await projectsService.getProjects();

    expect(getSpy).toHaveBeenCalledWith('/api/projects');
    expect(result).toHaveLength(1);

    getSpy.mockRestore();
  });

  it('sends the target status when toggling a project', async () => {
    const patchSpy = vi.spyOn(api, 'patch').mockResolvedValue({
      data: {
        allocationPct: 40,
        colorHex: '#506169',
        fixedDays: [],
        fixedHoursPerDay: 0,
        id: 'project-1',
        name: 'ClienteCore',
        sprintDays: 14,
        status: 'paused',
        type: 'rotative',
      },
    });

    await projectsService.toggleProjectStatus({ projectId: 'project-1', status: 'paused' });

    expect(patchSpy).toHaveBeenCalledWith('/api/projects/project-1/status', { status: 'paused' });

    patchSpy.mockRestore();
  });
}