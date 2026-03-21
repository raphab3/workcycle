import type { Project } from '@/modules/projects/types';
import type { Task, TaskColumn, TaskFormValues } from '@/modules/tasks/types';

export interface TaskFormProps {
  columns: TaskColumn[];
  defaultValues?: Task | null;
  onCancelEdit: () => void;
  onSubmitTask: (values: TaskFormValues, taskId?: string) => void;
  projects: Project[];
}