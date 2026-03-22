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

export type PulseResolution = 'pending' | 'confirmed' | 'inactive';

export interface PulseRecord {
  firedAt: string;
  respondedAt: string | null;
  status: 'confirmed' | 'unconfirmed';
  projectId: string | null;
  resolution: PulseResolution;
  reviewedAt: string | null;
  confirmedMinutes: number;
}

export interface ActivePulse {
  firedAt: string;
  expiresAt: string;
  projectId: string | null;
}

export interface RegularizationState {
  isOpen: boolean;
  highlightedPulseIndex: number | null;
}

export interface CloseDayReview {
  requiresConfirmation: boolean;
  unconfirmedMinutes: number;
  message: string | null;
}

export type CycleState = 'PLANNED' | 'ACTIVE' | 'CLOSED' | 'AUTO_CLOSED' | 'RECONCILED';

export interface CycleSnapshot {
  plannedHours: number;
  actualHours: number;
  completedTaskIds: string[];
  incompleteTaskIds: string[];
}