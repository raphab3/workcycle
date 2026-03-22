import type { Project, ProjectFormValues, WeekDay } from '@/modules/projects/types';

export interface ProjectFormProps {
  defaultValues?: Project | null;
  isSubmitting?: boolean;
  onCancelEdit: () => void;
  onSubmitProject: (values: ProjectFormValues, projectId?: string) => Promise<void> | void;
}

export interface DayOption {
  label: WeekDay;
  value: WeekDay;
}