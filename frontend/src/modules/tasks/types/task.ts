export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';
export type TaskStatus = 'todo' | 'doing' | 'blocked' | 'done';
export type TaskDeadlineState = 'overdue' | 'today' | 'soon' | 'planned';
export type TaskCycleAssignment = 'backlog' | 'current' | 'next';
export type TaskFilterValue = 'all';

export interface TaskChecklistItem {
  id: string;
  label: string;
  done: boolean;
}

export interface TaskColumn {
  id: string;
  title: string;
  status: TaskStatus;
}

export interface TaskColumnFormValues {
  title: string;
  status: TaskStatus;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  projectId: string;
  columnId: string;
  isArchived: boolean;
  checklist: TaskChecklistItem[];
  priority: TaskPriority;
  status: TaskStatus;
  cycleAssignment: TaskCycleAssignment;
  dueInDays: number;
  estimatedHours: number;
}

export interface TaskFormValues {
  title: string;
  description: string;
  projectId: string;
  columnId: string;
  checklist: TaskChecklistItem[];
  priority: TaskPriority;
  status: TaskStatus;
  cycleAssignment: TaskCycleAssignment;
  dueInDays: number;
  estimatedHours: number;
}

export interface TaskFiltersValues {
  projectId: string | TaskFilterValue;
  priority: TaskPriority | TaskFilterValue;
  status: TaskStatus | TaskFilterValue;
  cycleAssignment: TaskCycleAssignment | TaskFilterValue;
}

export interface ProjectTaskLoad {
  projectId: string;
  projectName: string;
  colorHex: string;
  openTasks: number;
  effortHours: number;
}

export interface TaskCyclePlanItem {
  taskId: string;
  title: string;
  projectId: string;
  projectName: string;
  colorHex: string;
  priority: TaskPriority;
  status: TaskStatus;
  estimatedHours: number;
  dueLabel: string;
  fitsInCycle: boolean;
  cumulativeHours: number;
}

export interface TaskCyclePlan {
  tasks: TaskCyclePlanItem[];
  plannedHours: number;
  remainingHours: number;
  overflowHours: number;
}