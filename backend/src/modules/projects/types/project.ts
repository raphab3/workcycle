import type { Project } from '@/shared/database/schema';

export type ProjectType = 'fixed' | 'rotative';
export type ProjectStatus = 'active' | 'paused';
export type SprintDays = 7 | 14 | 30;
export type WeekDay = 'Seg' | 'Ter' | 'Qua' | 'Qui' | 'Sex' | 'Sab' | 'Dom';

export interface ProjectResponse {
  allocationPct: number;
  colorHex: string;
  fixedDays: WeekDay[];
  fixedHoursPerDay: number;
  id: string;
  name: string;
  sprintDays: SprintDays;
  status: ProjectStatus;
  type: ProjectType;
}

export function toProjectResponse(project: Project): ProjectResponse {
  return {
    allocationPct: project.allocationPct,
    colorHex: project.colorHex,
    fixedDays: project.fixedDays as WeekDay[],
    fixedHoursPerDay: project.fixedHoursPerDay,
    id: project.id,
    name: project.name,
    sprintDays: project.sprintDays as SprintDays,
    status: project.status,
    type: project.type,
  };
}