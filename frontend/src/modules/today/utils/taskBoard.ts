import type { Task, TaskColumn, TaskStatus } from '@/modules/tasks/types';

export type TodayTaskBoardColumnKey = 'backlog' | 'in-progress' | 'done';

export interface TodayTaskBoardColumn {
  key: TodayTaskBoardColumnKey;
  title: string;
  status: TaskStatus;
  sourceColumnIds: string[];
  targetColumnId: string | null;
}

export function getTodayBoardColumns(taskColumns: TaskColumn[]): TodayTaskBoardColumn[] {
  const backlogColumns = taskColumns.filter((column) => column.status === 'todo');
  const doneColumns = taskColumns.filter((column) => column.status === 'done');
  const inProgressColumns = taskColumns.filter((column) => column.status !== 'todo' && column.status !== 'done');

  return [
    {
      key: 'backlog',
      title: 'Backlog',
      status: 'todo',
      sourceColumnIds: backlogColumns.map((column) => column.id),
      targetColumnId: backlogColumns[0]?.id ?? taskColumns[0]?.id ?? null,
    },
    {
      key: 'in-progress',
      title: 'In Progress',
      status: 'doing',
      sourceColumnIds: inProgressColumns.map((column) => column.id),
      targetColumnId: inProgressColumns[0]?.id ?? null,
    },
    {
      key: 'done',
      title: 'Done',
      status: 'done',
      sourceColumnIds: doneColumns.map((column) => column.id),
      targetColumnId: doneColumns.at(-1)?.id ?? taskColumns.at(-1)?.id ?? null,
    },
  ];
}

export function getTodayBoardColumnKey(task: Pick<Task, 'columnId' | 'status'>, taskColumns: TaskColumn[]): TodayTaskBoardColumnKey {
  const matchedColumn = taskColumns.find((column) => column.id === task.columnId);
  const status = matchedColumn?.status ?? task.status;

  if (status === 'done') {
    return 'done';
  }

  if (status === 'todo') {
    return 'backlog';
  }

  return 'in-progress';
}

export function getTodayBoardTasks(tasks: Task[], taskColumns: TaskColumn[], activeProjectId: string) {
  return tasks
    .filter((task) => !task.isArchived && task.projectId === activeProjectId && task.cycleAssignment === 'current')
    .reduce<Record<TodayTaskBoardColumnKey, Task[]>>((board, task) => {
      const columnKey = getTodayBoardColumnKey(task, taskColumns);

      return {
        ...board,
        [columnKey]: [...board[columnKey], task],
      };
    }, {
      backlog: [],
      'in-progress': [],
      done: [],
    });
}