import type { Project } from '@/modules/projects/types';
import type { TaskFiltersValues } from '@/modules/tasks/types';

export interface TaskFiltersProps {
  filters: TaskFiltersValues;
  onChange: (filters: TaskFiltersValues) => void;
  onReset: () => void;
  projects: Project[];
  visibleTasks: number;
}