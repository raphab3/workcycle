import { DEFAULT_USER_SETTINGS_VALUES } from '@/modules/settings/types/settings';

export const TODAY_SESSION_STATE_VALUES = ['idle', 'running', 'paused_manual', 'paused_inactivity', 'completed'] as const;
export const TODAY_PULSE_STATUS_VALUES = ['confirmed', 'unconfirmed'] as const;
export const TODAY_PULSE_RESOLUTION_VALUES = ['pending', 'confirmed', 'inactive'] as const;
export const TODAY_AUDIT_TRAIL_MODE_VALUES = ['inline-pulse-history'] as const;
export const TODAY_CONTRACT_STATUS_VALUES = ['defined', 'implementation-pending'] as const;
export const TODAY_ROLLOVER_STRATEGY_VALUES = ['auto-close-and-open-next', 'manual-start-next'] as const;
export const TODAY_TASK_RELATION_MODE_VALUES = ['cycle-session-and-assignment'] as const;

export type TodaySessionState = (typeof TODAY_SESSION_STATE_VALUES)[number];
export type TodayPulseStatus = (typeof TODAY_PULSE_STATUS_VALUES)[number];
export type TodayPulseResolution = (typeof TODAY_PULSE_RESOLUTION_VALUES)[number];
export type TodayAuditTrailMode = (typeof TODAY_AUDIT_TRAIL_MODE_VALUES)[number];
export type TodayContractStatus = (typeof TODAY_CONTRACT_STATUS_VALUES)[number];
export type TodayRolloverStrategy = (typeof TODAY_ROLLOVER_STRATEGY_VALUES)[number];
export type TodayTaskRelationMode = (typeof TODAY_TASK_RELATION_MODE_VALUES)[number];

export interface TodayTimeBlockDTO {
  confirmedMinutes: number;
  endedAt: string | null;
  id: string;
  projectId: string;
  startedAt: string;
}

export interface TodayPulseRecordDTO {
  confirmedMinutes: number;
  firedAt: string;
  projectId: string | null;
  resolution: TodayPulseResolution;
  respondedAt: string | null;
  reviewedAt: string | null;
  status: TodayPulseStatus;
}

export interface TodayActivePulseDTO {
  expiresAt: string;
  firedAt: string;
  projectId: string | null;
}

export interface TodayRegularizationEntryDTO {
  confirmedMinutes: number;
  nextResolution: Exclude<TodayPulseResolution, 'pending'>;
  previousResolution: TodayPulseResolution;
  pulseFiredAt: string;
  reason: string | null;
  reviewedAt: string;
}

export interface TodayRegularizationDTO {
  highlightedPulseIndex: number | null;
  history: TodayRegularizationEntryDTO[];
  isOpen: boolean;
  pendingPulseCount: number;
}

export interface TodayCloseDayReviewDTO {
  closedAt: string | null;
  message: string | null;
  requiresConfirmation: boolean;
  unconfirmedMinutes: number;
}

export interface TodayRolloverWindowDTO {
  endsAt: string;
  startsAt: string;
}

export interface TodayOperationalBoundaryDTO {
  boundaryStartsAt: string;
  cycleStartHour: string;
  rolloverWindow: TodayRolloverWindowDTO;
  timezone: string;
}

export interface TodayTaskScopeDTO {
  completedTaskIds: string[];
  currentTaskIds: string[];
  linkedCycleSessionId: string | null;
  nextCycleTaskIds: string[];
  relationMode: TodayTaskRelationMode;
}

export interface TodayCycleSnapshotDTO {
  actualHours: number;
  completedTaskIds: string[];
  incompleteTaskIds: string[];
  plannedHours: number;
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
    active: TodayActivePulseDTO | null;
    history: TodayPulseRecordDTO[];
  };
  regularization: TodayRegularizationDTO;
  rollover: TodayRolloverDTO;
  snapshot: TodayCycleSnapshotDTO | null;
  startedAt: string | null;
  state: TodaySessionState;
  taskScope: TodayTaskScopeDTO;
  timeBlocks: TodayTimeBlockDTO[];
}

export interface TodayAuditTrailDecisionDTO {
  minimumMode: TodayAuditTrailMode;
  rationale: string;
  separateAuditTableRequired: boolean;
}

export interface TodayContractStatusDTO {
  auditTrailDecision: TodayAuditTrailDecisionDTO;
  contractVersion: string;
  notes: string[];
  status: TodayContractStatus;
  targetSession: TodaySessionDTO;
}

export function createTodayContractStatus(): TodayContractStatusDTO {
  return {
    auditTrailDecision: {
      minimumMode: 'inline-pulse-history',
      rationale: 'Regularizacoes ficam rastreadas na pulse history da propria sessao diaria no MVP. Uma tabela dedicada de auditoria so passa a ser necessaria quando houver revisao retroativa multi-dia, exigencia de compliance ou exportacao historica independente.',
      separateAuditTableRequired: false,
    },
    contractVersion: '2026-03-23',
    notes: [
      'Today passa a ser o source of truth do backend para sessao diaria, pulses, regularizacao, fechamento e rollover.',
      'Tasks se relacionam ao ciclo concreto do dia por cycleSessionId e cycleAssignment, evitando acoplamento apenas visual no frontend.',
      'Timezone e cycleStartHour entram no contrato operacional para sustentar boundary e rollover alinhados com Settings.',
    ],
    status: 'defined',
    targetSession: {
      activeProjectId: null,
      closeDayReview: {
        closedAt: null,
        message: null,
        requiresConfirmation: false,
        unconfirmedMinutes: 0,
      },
      closedAt: null,
      cycleDate: '2026-03-23',
      id: null,
      operationalBoundary: {
        boundaryStartsAt: '2026-03-23T00:00:00.000Z',
        cycleStartHour: DEFAULT_USER_SETTINGS_VALUES.cycleStartHour,
        rolloverWindow: {
          endsAt: '2026-03-24T00:05:00.000Z',
          startsAt: '2026-03-23T23:55:00.000Z',
        },
        timezone: DEFAULT_USER_SETTINGS_VALUES.timezone,
      },
      pulses: {
        active: null,
        history: [],
      },
      regularization: {
        highlightedPulseIndex: null,
        history: [],
        isOpen: false,
        pendingPulseCount: 0,
      },
      rollover: {
        carryOverInProgressTaskIds: [],
        noticeDescription: null,
        noticeTitle: null,
        previousCycleDate: null,
        strategy: 'manual-start-next',
        triggeredAt: null,
      },
      snapshot: null,
      startedAt: null,
      state: 'idle',
      taskScope: {
        completedTaskIds: [],
        currentTaskIds: [],
        linkedCycleSessionId: null,
        nextCycleTaskIds: [],
        relationMode: 'cycle-session-and-assignment',
      },
      timeBlocks: [],
    },
  };
}