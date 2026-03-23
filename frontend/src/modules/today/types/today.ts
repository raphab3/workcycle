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
  id?: string;
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

export interface PreviousCycleSummary {
  cycleDate: string;
  snapshot: CycleSnapshot;
  activeProjectId: string | null;
  inProgressTaskIds: string[];
}

export interface RolloverNotice {
  previousCycleDate: string;
  title: string;
  description: string;
}

export type TodayPulseStatus = 'confirmed' | 'unconfirmed';
export type TodayRolloverStrategy = 'auto-close-and-open-next' | 'manual-start-next';

export interface TodayRegularizationEntryDTO {
  confirmedMinutes: number;
  nextResolution: Exclude<PulseResolution, 'pending'>;
  previousResolution: PulseResolution;
  pulseFiredAt: string;
  reason: string | null;
  reviewedAt: string;
}

export interface TodayRegularizationDTO extends RegularizationState {
  history: TodayRegularizationEntryDTO[];
  pendingPulseCount: number;
}

export interface TodayCloseDayReviewDTO extends CloseDayReview {
  closedAt: string | null;
}

export interface TodayOperationalBoundaryDTO {
  boundaryStartsAt: string;
  cycleStartHour: string;
  rolloverWindow: {
    endsAt: string;
    startsAt: string;
  };
  timezone: string;
}

export interface TodayTaskScopeDTO {
  completedTaskIds: string[];
  currentTaskIds: string[];
  linkedCycleSessionId: string | null;
  nextCycleTaskIds: string[];
  relationMode: 'cycle-session-and-assignment';
}

export interface TodayRolloverDTO {
  carryOverInProgressTaskIds: string[];
  noticeDescription: string | null;
  noticeTitle: string | null;
  previousCycleDate: string | null;
  strategy: TodayRolloverStrategy;
  triggeredAt: string | null;
}

export interface TodaySessionDTO {
  activeProjectId: string | null;
  closeDayReview: TodayCloseDayReviewDTO;
  closedAt: string | null;
  cycleDate: string;
  id: string | null;
  operationalBoundary: TodayOperationalBoundaryDTO;
  pulses: {
    active: ActivePulse | null;
    history: PulseRecord[];
  };
  regularization: TodayRegularizationDTO;
  rollover: TodayRolloverDTO;
  snapshot: CycleSnapshot | null;
  startedAt: string | null;
  state: SessionState;
  taskScope: TodayTaskScopeDTO;
  timeBlocks: TimeBlock[];
}

export interface UpdateTodaySessionInput {
  activeProjectId?: string | null;
  closedAt?: string | null;
  cycleDate?: string;
  rollover?: Partial<TodayRolloverDTO> & Pick<TodayRolloverDTO, 'strategy'>;
  sessionId?: string;
  snapshot?: CycleSnapshot | null;
  startedAt?: string | null;
  state?: SessionState;
  timeBlocks?: Array<Pick<TimeBlock, 'confirmedMinutes' | 'endedAt' | 'projectId' | 'startedAt'>>;
}

export interface FirePulseInputDTO {
  confirmedMinutes?: number;
  expiresAt?: string;
  firedAt: string;
  projectId?: string | null;
  resolution: PulseResolution;
  respondedAt?: string | null;
  reviewedAt?: string | null;
  sessionId: string;
  status: TodayPulseStatus;
}