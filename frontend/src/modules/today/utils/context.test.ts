import { mockProjects } from '@/modules/projects/mocks/projects';
import { mockTasks } from '@/modules/tasks/mocks/tasks';
import { getProjectLoadSummary } from '@/modules/tasks/utils/tasks';

import { buildTodayOperationalContext } from './context';
import { buildSuggestedAllocations, createActualHoursMap } from './planner';

describe('today operational context helpers', () => {
  it('summarizes current pace, future load and immediate risk', () => {
    const activeProjects = mockProjects.filter((project) => project.status === 'active');
    const projectLoadSummary = getProjectLoadSummary(mockTasks, activeProjects);
    const allocations = buildSuggestedAllocations(activeProjects, projectLoadSummary, {
      availableHours: 10,
      projectsInCycle: 3,
    });
    const actualHours = createActualHoursMap(allocations);
    const context = buildTodayOperationalContext({
      projects: mockProjects,
      tasks: mockTasks,
      allocations,
      actualHours,
      projectLoadSummary,
    });

    expect(context.plannedTodayHours).toBe(10);
    expect(context.actualTodayHours).toBe(10);
    expect(context.projectedWeekHours).toBe(50);
    expect(context.monthBacklogSharePct).toBe(5);
    expect(context.overdueTasksCount).toBe(1);
    expect(context.dueTodayTasksCount).toBe(1);
    expect(context.blockedTasksCount).toBe(1);
    expect(context.cards[2]).toEqual(expect.objectContaining({ tone: 'danger' }));
    expect(context.contextSignals).toContain('AuthGuard pausado com pendencia aberta');
  });
});