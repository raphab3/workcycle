import type { Project } from '@/modules/projects/types';
import type { Task, TaskColumn, TaskFormValues } from '@/modules/tasks/types';

export interface CycleTasksBoardProps {
  activeProject: Project;
  projects: Project[];
  taskColumns: TaskColumn[];
  tasks: Task[];
  onMoveTaskOnBoard: (taskId: string, columnId: string, beforeTaskId?: string) => void;
  onSkipTask: (taskId: string, strategy: 'reset-to-backlog' | 'keep-stage') => void;
  onUpdateTask: (taskId: string, values: TaskFormValues) => void;
}