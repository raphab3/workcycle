import type { Project } from '@/modules/projects/types';
import type { Task, TaskColumn, TaskColumnFormValues } from '@/modules/tasks/types';

export interface TasksListProps {
  onAddColumn: (values: TaskColumnFormValues) => void;
  onAssignCycle: (taskId: string, cycleAssignment: Task['cycleAssignment']) => void;
  onEditTask: (task: Task) => void;
  onMoveTaskToColumn: (taskId: string, columnId: string) => void;
  onToggleDone: (taskId: string) => void;
  projects: Project[];
  taskColumns: TaskColumn[];
  tasks: Task[];
}