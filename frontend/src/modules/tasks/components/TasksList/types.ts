import type { Project } from '@/modules/projects/types';
import type { Task, TaskColumn } from '@/modules/tasks/types';

export interface TasksListProps {
  onAssignCycle: (taskId: string, cycleAssignment: Task['cycleAssignment']) => void;
  onArchiveTask: (task: Task) => void;
  onEditTask: (task: Task) => void;
  isDisabled?: boolean;
  onMoveTaskToColumn: (taskId: string, columnId: string) => void;
  onToggleDone: (taskId: string) => void;
  projects: Project[];
  taskColumns: TaskColumn[];
  tasks: Task[];
}