import { defaultTaskColumns } from '@/modules/tasks/mocks/taskColumns';
import { mockTasks } from '@/modules/tasks/mocks/tasks';

import { getTodayBoardColumnKey, getTodayBoardColumns, getTodayBoardTasks } from './taskBoard';

describe('taskBoard utils', () => {
  it('maps dynamic task columns to the fixed Hoje board columns', () => {
    const columns = getTodayBoardColumns(defaultTaskColumns);

    expect(columns.map((column) => column.title)).toEqual(['Backlog', 'In Progress', 'Done']);
    expect(columns[0]?.sourceColumnIds).toEqual(['backlog']);
    expect(columns[1]?.sourceColumnIds).toEqual(['in-progress', 'code-review']);
    expect(columns[2]?.sourceColumnIds).toEqual(['done']);
    expect(getTodayBoardColumnKey(mockTasks[0], defaultTaskColumns)).toBe('backlog');
    expect(getTodayBoardColumnKey(mockTasks[1], defaultTaskColumns)).toBe('in-progress');
    expect(getTodayBoardColumnKey(mockTasks[4], defaultTaskColumns)).toBe('done');
  });

  it('filters tasks by active project and current cycle only', () => {
    const boardTasks = getTodayBoardTasks(mockTasks, defaultTaskColumns, 'datavault');

    expect(boardTasks.backlog.map((task) => task.id)).toEqual(['billing-migration']);
    expect(boardTasks['in-progress']).toHaveLength(0);
    expect(boardTasks.done).toHaveLength(0);
  });
});