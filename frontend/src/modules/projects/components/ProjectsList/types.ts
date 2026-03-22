import type { Project } from '@/modules/projects/types';

export interface ProjectsListProps {
  isDisabled?: boolean;
  onEditProject: (project: Project) => void;
  onToggleStatus: (projectId: string) => void;
  projects: Project[];
}