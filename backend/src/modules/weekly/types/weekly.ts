export const WEEKLY_DAY_VALUES = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'] as const;
export const WEEKLY_DEVIATION_STATUS_VALUES = ['balanced', 'attention', 'critical'] as const;
export const WEEKLY_SNAPSHOT_SOURCE_VALUES = ['derived-open-week', 'persisted-weekly-history'] as const;

export type WeeklyDay = (typeof WEEKLY_DAY_VALUES)[number];
export type WeeklyDeviationStatus = (typeof WEEKLY_DEVIATION_STATUS_VALUES)[number];
export type WeeklySnapshotSource = (typeof WEEKLY_SNAPSHOT_SOURCE_VALUES)[number];

export interface WeeklyDayCellDTO {
  actualHours: number;
  date: string;
  day: WeeklyDay;
  isProvisional: boolean;
  plannedHours: number;
}

export interface WeeklyProjectRowDTO {
  actualWeekHours: number;
  cells: WeeklyDayCellDTO[];
  colorHex: string;
  deltaHours: number;
  plannedWeekHours: number;
  projectId: string;
  projectName: string;
  status: WeeklyDeviationStatus;
}

export interface WeeklySummaryMetricsDTO {
  actualWeekHours: number;
  attentionProjects: number;
  criticalProjects: number;
  plannedWeekHours: number;
}

export interface WeeklySnapshotResponseDTO {
  generatedAt: string;
  isFinal: boolean;
  rows: WeeklyProjectRowDTO[];
  source: WeeklySnapshotSource;
  summary: WeeklySummaryMetricsDTO;
  timezone: string;
  weekEndsAt: string;
  weekKey: string;
  weekStartsAt: string;
}

export interface WeeklyHistoryResponseDTO {
  snapshots: WeeklySnapshotResponseDTO[];
}