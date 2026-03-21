export type ProjectType = 'fixed' | 'rotative';
export type ProjectStatus = 'active' | 'paused';
export type SprintDays = 7 | 14 | 30;
export type WeekDay = 'Seg' | 'Ter' | 'Qua' | 'Qui' | 'Sex' | 'Sab' | 'Dom';

export interface Project {
  id: string;
  name: string;
  colorHex: string;
  allocationPct: number;
  type: ProjectType;
  sprintDays: SprintDays;
  status: ProjectStatus;
  fixedDays: WeekDay[];
  fixedHoursPerDay: number;
}

export interface ProjectFormValues {
  name: string;
  colorHex: string;
  allocationPct: number;
  type: ProjectType;
  sprintDays: SprintDays;
  status: ProjectStatus;
  fixedDays: WeekDay[];
  fixedHoursPerDay: number;
}