import type { WeekDay } from '@/modules/projects/types';

export type WeeklyDeviationStatus = 'balanced' | 'attention' | 'critical';
export type WeeklySnapshotSource = 'derived-open-week' | 'persisted-weekly-history';

export interface WeeklyDayCell {
  date?: string;
  day: WeekDay;
  isProvisional?: boolean;
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
  generatedAt?: string;
  isFinal?: boolean;
  rows: WeeklyProjectRow[];
  source?: WeeklySnapshotSource;
  summary: WeeklySummaryMetrics;
  timezone?: string;
  weekEndsAt?: string;
  weekKey?: string;
  weekStartsAt?: string;
}

export interface WeeklySnapshotDTO extends WeeklyScenario {
  generatedAt: string;
  isFinal: boolean;
  source: WeeklySnapshotSource;
  timezone: string;
  weekEndsAt: string;
  weekKey: string;
  weekStartsAt: string;
}

export interface WeeklyHistoryDTO {
  snapshots: WeeklySnapshotDTO[];
}

export interface WeeklySnapshotQueryInput {
  weekKey?: string;
}

export interface WeeklyHistoryQueryInput {
  fromWeekKey?: string;
  limit?: number;
  toWeekKey?: string;
}