export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';
export type TaskStatus = 'todo' | 'doing' | 'blocked' | 'done';
export type TaskDeadlineState = 'overdue' | 'today' | 'soon' | 'planned';
export type TaskFilterValue = 'all';

export interface Task {
  id: string;
  title: string;
  projectId: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueInDays: number;
  estimatedHours: number;
}

export interface TaskFormValues {
  title: string;
  projectId: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueInDays: number;
  estimatedHours: number;
}

export interface TaskFiltersValues {
  projectId: string | TaskFilterValue;
  priority: TaskPriority | TaskFilterValue;
  status: TaskStatus | TaskFilterValue;
}

export interface ProjectTaskLoad {
  projectId: string;
  projectName: string;
  colorHex: string;
  openTasks: number;
  effortHours: number;
}