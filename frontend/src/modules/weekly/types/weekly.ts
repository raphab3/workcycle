import type { WeekDay } from '@/modules/projects/types';

export type WeeklyDeviationStatus = 'balanced' | 'attention' | 'critical';

export interface WeeklyDayCell {
  day: WeekDay;
  plannedHours: number;
  actualHours: number;
}

export interface WeeklyProjectRow {
  projectId: string;
  projectName: string;
  colorHex: string;
  plannedWeekHours: number;
  actualWeekHours: number;
  deltaHours: number;
  status: WeeklyDeviationStatus;
  cells: WeeklyDayCell[];
}

export interface WeeklySummaryMetrics {
  plannedWeekHours: number;
  actualWeekHours: number;
  criticalProjects: number;
  attentionProjects: number;
}

export interface WeeklyScenario {
  rows: WeeklyProjectRow[];
  summary: WeeklySummaryMetrics;
}