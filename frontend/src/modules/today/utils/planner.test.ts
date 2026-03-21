import { mockProjects } from '@/modules/projects/mocks/projects';
import { mockTasks } from '@/modules/tasks/mocks/tasks';
import { getProjectLoadSummary } from '@/modules/tasks/utils/tasks';

import { buildSuggestedAllocations, createActualHoursMap, formatHours, getActualHoursTotal } from './planner';

describe('today planner helpers', () => {
  it('keeps fixed projects and distributes remaining hours to rotative projects', () => {
    const summary = getProjectLoadSummary(mockTasks, mockProjects);
    const allocations = buildSuggestedAllocations(mockProjects, summary, {
      availableHours: 10,
      projectsInCycle: 3,
    });

    expect(allocations[0]).toEqual(expect.objectContaining({ projectName: 'ClienteCore', kind: 'fixed' }));
    expect(allocations.some((allocation) => allocation.projectName === 'FinTrack')).toBe(true);
  });

  it('creates and totals actual hours from planned allocations', () => {
    const summary = getProjectLoadSummary(mockTasks, mockProjects);
    const allocations = buildSuggestedAllocations(mockProjects, summary, {
      availableHours: 10,
      projectsInCycle: 3,
    });

    const actualHours = createActualHoursMap(allocations);

    expect(getActualHoursTotal(actualHours)).toBeGreaterThan(0);
    expect(formatHours(2.5)).toBe('2h30');
  });
});