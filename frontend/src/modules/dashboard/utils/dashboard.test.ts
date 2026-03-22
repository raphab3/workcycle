import { mockProjects } from '@/modules/projects/mocks/projects';
import { mockTasks } from '@/modules/tasks/mocks/tasks';
import { buildSuggestedAllocations, createActualHoursMap, getDefaultCycleValues } from '@/modules/today/utils/planner';

import { buildDashboardScenario } from './dashboard';

describe('buildDashboardScenario', () => {
  it('aggregates analytical sections from the shared workspace state', () => {
    const activeProjects = mockProjects.filter((project) => project.status === 'active');
    const cycleValues = getDefaultCycleValues(mockProjects);
    const allocations = buildSuggestedAllocations(activeProjects, [], cycleValues);
    const actualHours = createActualHoursMap(allocations);
    const scenario = buildDashboardScenario({
      projects: mockProjects,
      tasks: mockTasks,
      cycleValues,
      cycleDate: '2026-03-22',
      actualHours,
    });

    expect(scenario.context.cards).toHaveLength(3);
    expect(scenario.weekly.rows.length).toBeGreaterThan(0);
    expect(scenario.loadRows[0]?.projectName).toBeTruthy();
    expect(scenario.riskSignals.some((signal) => signal.id === 'blocked')).toBe(true);
    expect(scenario.timeSpentRows[0]?.weekHours).toBeGreaterThanOrEqual(0);
    expect(scenario.timeline).toHaveLength(30);
    expect(scenario.timeline[29]?.projects.length).toBeGreaterThan(0);
  });
});