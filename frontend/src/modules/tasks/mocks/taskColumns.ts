import type { TaskColumn } from '@/modules/tasks/types';

export const defaultTaskColumns: TaskColumn[] = [
  {
    id: 'backlog',
    title: 'Backlog',
    status: 'todo',
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    status: 'doing',
  },
  {
    id: 'code-review',
    title: 'CodeReview',
    status: 'blocked',
  },
  {
    id: 'done',
    title: 'Done',
    status: 'done',
  },
];