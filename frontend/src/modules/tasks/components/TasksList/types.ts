import type { Project } from '@/modules/projects/types';
import type { Task } from '@/modules/tasks/types';

export interface TasksListProps {
  onEditTask: (task: Task) => void;
  onToggleDone: (taskId: string) => void;
  projects: Project[];
  tasks: Task[];
}