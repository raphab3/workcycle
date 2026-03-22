export interface TodayCycleValues {
  availableHours: number;
  projectsInCycle: number;
}

export interface SuggestedAllocation {
  projectId: string;
  projectName: string;
  colorHex: string;
  kind: 'fixed' | 'rotative';
  currentAllocationPct: number;
  suggestedAllocationPct: number;
  plannedHours: number;
  openTasks: number;
  effortHours: number;
  reason: string;
}

export type SessionState = 'idle' | 'running' | 'paused_manual' | 'paused_inactivity' | 'completed';

export interface TimeBlock {
  projectId: string;
  startedAt: string;
  endedAt: string | null;
  confirmedMinutes: number;
}

export interface PulseRecord {
  firedAt: string;
  respondedAt: string | null;
  status: 'confirmed' | 'unconfirmed';
}

export type CycleState = 'PLANNED' | 'ACTIVE' | 'CLOSED' | 'AUTO_CLOSED' | 'RECONCILED';

export interface CycleSnapshot {
  plannedHours: number;
  actualHours: number;
  completedTaskIds: string[];
  incompleteTaskIds: string[];
}