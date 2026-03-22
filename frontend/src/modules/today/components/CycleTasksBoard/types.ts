import type { Project } from '@/modules/projects/types';
import type { Task, TaskColumn } from '@/modules/tasks/types';

export interface CycleTasksBoardProps {
  activeProject: Project;
  taskColumns: TaskColumn[];
  tasks: Task[];
  onMoveTaskToColumn: (taskId: string, columnId: string) => void;
  onSkipTask: (taskId: string, strategy: 'reset-to-backlog' | 'keep-stage') => void;
}