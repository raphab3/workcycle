import type { Project } from '@/modules/projects/types';
import type { Task, TaskFormValues } from '@/modules/tasks/types';

export interface TaskFormProps {
  defaultValues?: Task | null;
  onCancelEdit: () => void;
  onSubmitTask: (values: TaskFormValues, taskId?: string) => void;
  projects: Project[];
}