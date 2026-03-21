import { mockProjects } from '@/modules/projects/mocks/projects';
import { mockTasks } from '@/modules/tasks/mocks/tasks';

import { filterTasks, getProjectLoadSummary, getTaskDeadlineLabel, getTaskDeadlineState, getUrgentTasksCount } from './tasks';

describe('tasks helpers', () => {
  it('filters tasks by project and priority', () => {
    const filtered = filterTasks(mockTasks, {
      projectId: 'fintrack',
      priority: 'high',
      status: 'all',
    });

    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.title).toBe('Fechar refinamento da sprint');
  });

  it('classifies deadline states and labels', () => {
    expect(getTaskDeadlineState(mockTasks[0])).toBe('today');
    expect(getTaskDeadlineLabel(mockTasks[0])).toBe('vence hoje');
    expect(getTaskDeadlineState(mockTasks[3])).toBe('overdue');
  });

  it('aggregates open load by project', () => {
    const summary = getProjectLoadSummary(mockTasks, mockProjects);

    expect(summary[0]).toEqual(
      expect.objectContaining({ projectName: 'DataVault', openTasks: 1, effortHours: 3.5 }),
    );
    expect(getUrgentTasksCount(mockTasks)).toBe(2);
  });
});