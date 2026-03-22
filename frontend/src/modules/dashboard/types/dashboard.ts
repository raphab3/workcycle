import type { ProjectTaskLoad, Task } from '@/modules/tasks/types';
import type { TodayContextCard, TodayOperationalContext, TodayContextTone } from '@/modules/today/utils/context';
import type { WeeklyProjectRow, WeeklyScenario } from '@/modules/weekly/types';

export interface DashboardProjectLoadRow extends ProjectTaskLoad {
  blockedTasks: number;
  overdueTasks: number;
  dueSoonTasks: number;
  pressureScore: number;
}

export interface DashboardRiskSignalItem {
  id: 'overdue' | 'due-soon' | 'blocked' | 'sprint';
  eyebrow: string;
  title: string;
  description: string;
  tone: TodayContextTone;
  count: number;
  details: string[];
}

export interface DashboardTimeSpentRow {
  projectId: string;
  projectName: string;
  colorHex: string;
  weekHours: number;
  monthHours: number;
}

export interface DashboardTimelineProjectHours {
  projectId: string;
  projectName: string;
  colorHex: string;
  hours: number;
}

export interface DashboardTimelinePoint {
  date: string;
  shortLabel: string;
  totalHours: number;
  projects: DashboardTimelineProjectHours[];
}

export interface DashboardScenarioSummary {
  context: TodayOperationalContext;
  weekly: WeeklyScenario;
  loadRows: DashboardProjectLoadRow[];
  riskSignals: DashboardRiskSignalItem[];
  timeSpentRows: DashboardTimeSpentRow[];
  timeline: DashboardTimelinePoint[];
  highlightedWeeklyRows: WeeklyProjectRow[];
  topRisks: Task[];
}

export type { TodayContextCard };