import type { Project } from '@/modules/projects/types';
import type { Task, TaskColumn } from '@/modules/tasks/types';

export interface CycleTasksBoardProps {
  activeProject: Project;
  taskColumns: TaskColumn[];
  tasks: Task[];
  onMoveTaskOnBoard: (taskId: string, columnId: string, beforeTaskId?: string) => void;
  onSkipTask: (taskId: string, strategy: 'reset-to-backlog' | 'keep-stage') => void;
  onOpenTask: (taskId: string) => void;
}