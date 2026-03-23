import type { CycleSession, Task, TaskChecklistItem } from '@/shared/database/schema';

export const TASK_PRIORITY_VALUES = ['critical', 'high', 'medium', 'low'] as const;
export const TASK_STATUS_VALUES = ['todo', 'doing', 'blocked', 'done'] as const;
export const TASK_CYCLE_ASSIGNMENT_VALUES = ['backlog', 'current', 'next'] as const;
export const TASK_BOARD_COLUMN_IDS = ['backlog', 'in-progress', 'code-review', 'done'] as const;
export const CYCLE_SESSION_STATE_VALUES = ['idle', 'running', 'paused_manual', 'paused_inactivity', 'completed'] as const;

export type TaskPriority = (typeof TASK_PRIORITY_VALUES)[number];
export type TaskStatus = (typeof TASK_STATUS_VALUES)[number];
export type TaskCycleAssignment = (typeof TASK_CYCLE_ASSIGNMENT_VALUES)[number];
export type TaskBoardColumnId = (typeof TASK_BOARD_COLUMN_IDS)[number];
export type CycleSessionState = (typeof CYCLE_SESSION_STATE_VALUES)[number];

export interface TaskBoardColumn {
  id: TaskBoardColumnId;
  order: number;
  status: TaskStatus;
  title: string;
}

export interface TaskChecklistItemRecord {
  done: boolean;
  id: string;
  label: string;
  position: number;
}

export interface TaskChecklistWriteItem {
  isDone: boolean;
  label: string;
  position: number;
}

export interface TaskPersistenceAggregate {
  checklistItems: TaskChecklistItem[];
  task: Task;
}

export interface TaskRecordDTO {
  checklist: TaskChecklistItemRecord[];
  columnId: TaskBoardColumnId;
  cycleAssignment: TaskCycleAssignment;
  cycleSessionId: string | null;
  description: string | null;
  dueDate: string | null;
  estimatedHours: number;
  id: string;
  isArchived: boolean;
  priority: TaskPriority;
  projectId: string;
  status: TaskStatus;
  title: string;
  userId: string;
}

export interface CycleSessionRecordDTO {
  activeProjectId: string | null;
  closedAt: string | null;
  cycleDate: string;
  id: string;
  startedAt: string | null;
  state: CycleSessionState;
  userId: string;
}

export const TASK_BOARD_COLUMNS: TaskBoardColumn[] = [
  { id: 'backlog', order: 0, status: 'todo', title: 'Backlog' },
  { id: 'in-progress', order: 1, status: 'doing', title: 'In Progress' },
  { id: 'code-review', order: 2, status: 'blocked', title: 'Code Review' },
  { id: 'done', order: 3, status: 'done', title: 'Done' },
];

export function getTaskBoardColumn(columnId: TaskBoardColumnId) {
  return TASK_BOARD_COLUMNS.find((column) => column.id === columnId);
}

export function getTaskStatusForColumn(columnId: TaskBoardColumnId): TaskStatus {
  const column = getTaskBoardColumn(columnId);

  if (!column) {
    throw new Error(`Unknown task board column: ${columnId}`);
  }

  return column.status;
}

export function toTaskChecklistItemRecord(item: TaskChecklistItem): TaskChecklistItemRecord {
  return {
    done: item.isDone,
    id: item.id,
    label: item.label,
    position: item.position,
  };
}

export function toTaskRecord(task: Task, checklist: TaskChecklistItem[] = []): TaskRecordDTO {
  return {
    checklist: checklist
      .slice()
      .sort((left, right) => left.position - right.position)
      .map(toTaskChecklistItemRecord),
    columnId: task.columnId as TaskBoardColumnId,
    cycleAssignment: task.cycleAssignment,
    cycleSessionId: task.cycleSessionId,
    description: task.description,
    dueDate: task.dueDate,
    estimatedHours: task.estimatedHours,
    id: task.id,
    isArchived: task.isArchived,
    priority: task.priority,
    projectId: task.projectId,
    status: task.status,
    title: task.title,
    userId: task.userId,
  };
}

export function toTaskPersistenceAggregate(task: Task, checklistItems: TaskChecklistItem[] = []): TaskPersistenceAggregate {
  return {
    checklistItems,
    task,
  };
}

export function toCycleSessionRecord(session: CycleSession): CycleSessionRecordDTO {
  return {
    activeProjectId: session.activeProjectId,
    closedAt: session.closedAt?.toISOString() ?? null,
    cycleDate: session.cycleDate,
    id: session.id,
    startedAt: session.startedAt?.toISOString() ?? null,
    state: session.state,
    userId: session.userId,
  };
}