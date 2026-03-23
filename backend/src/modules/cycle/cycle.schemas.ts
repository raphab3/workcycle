import { z } from 'zod';

import {
  TODAY_AUDIT_TRAIL_MODE_VALUES,
  TODAY_CONTRACT_STATUS_VALUES,
  TODAY_PULSE_RESOLUTION_VALUES,
  TODAY_PULSE_STATUS_VALUES,
  TODAY_ROLLOVER_STRATEGY_VALUES,
  TODAY_SESSION_STATE_VALUES,
  TODAY_TASK_RELATION_MODE_VALUES,
} from '@/modules/cycle/types/today';

const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use o formato YYYY-MM-DD para cycleDate.');
const isoTimestampSchema = z.string().datetime({ offset: true });
const nullableIsoTimestampSchema = isoTimestampSchema.nullable();

const todayTimeBlockSchema = z.object({
  confirmedMinutes: z.number().int().min(0),
  endedAt: nullableIsoTimestampSchema,
  id: z.string().trim().min(1),
  projectId: z.string().trim().min(1),
  startedAt: isoTimestampSchema,
});

const todayPulseRecordSchema = z.object({
  confirmedMinutes: z.number().int().min(0),
  firedAt: isoTimestampSchema,
  projectId: z.string().trim().min(1).nullable(),
  resolution: z.enum(TODAY_PULSE_RESOLUTION_VALUES),
  respondedAt: nullableIsoTimestampSchema,
  reviewedAt: nullableIsoTimestampSchema,
  status: z.enum(TODAY_PULSE_STATUS_VALUES),
});

const todayActivePulseSchema = z.object({
  expiresAt: isoTimestampSchema,
  firedAt: isoTimestampSchema,
  projectId: z.string().trim().min(1).nullable(),
});

const todayRegularizationEntrySchema = z.object({
  confirmedMinutes: z.number().int().min(0),
  nextResolution: z.enum(['confirmed', 'inactive']),
  previousResolution: z.enum(TODAY_PULSE_RESOLUTION_VALUES),
  pulseFiredAt: isoTimestampSchema,
  reason: z.string().trim().max(500).nullable(),
  reviewedAt: isoTimestampSchema,
});

const todayRegularizationSchema = z.object({
  highlightedPulseIndex: z.number().int().min(0).nullable(),
  history: z.array(todayRegularizationEntrySchema),
  isOpen: z.boolean(),
  pendingPulseCount: z.number().int().min(0),
});

const todayCloseDayReviewSchema = z.object({
  closedAt: nullableIsoTimestampSchema,
  message: z.string().trim().max(500).nullable(),
  requiresConfirmation: z.boolean(),
  unconfirmedMinutes: z.number().int().min(0),
});

const todayOperationalBoundarySchema = z.object({
  boundaryStartsAt: isoTimestampSchema,
  cycleStartHour: z.string().trim().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Use o formato HH:mm para cycleStartHour.'),
  rolloverWindow: z.object({
    endsAt: isoTimestampSchema,
    startsAt: isoTimestampSchema,
  }),
  timezone: z.string().trim().min(1).max(120),
});

const todayTaskScopeSchema = z.object({
  completedTaskIds: z.array(z.string().trim().min(1)),
  currentTaskIds: z.array(z.string().trim().min(1)),
  linkedCycleSessionId: z.string().trim().min(1).nullable(),
  nextCycleTaskIds: z.array(z.string().trim().min(1)),
  relationMode: z.enum(TODAY_TASK_RELATION_MODE_VALUES),
});

const todayCycleSnapshotSchema = z.object({
  actualHours: z.number().min(0),
  completedTaskIds: z.array(z.string().trim().min(1)),
  incompleteTaskIds: z.array(z.string().trim().min(1)),
  plannedHours: z.number().min(0),
});

const todayRolloverSchema = z.object({
  carryOverInProgressTaskIds: z.array(z.string().trim().min(1)),
  noticeDescription: z.string().trim().max(500).nullable(),
  noticeTitle: z.string().trim().max(255).nullable(),
  previousCycleDate: isoDateSchema.nullable(),
  strategy: z.enum(TODAY_ROLLOVER_STRATEGY_VALUES),
  triggeredAt: nullableIsoTimestampSchema,
});

export const todaySessionSchema = z.object({
  activeProjectId: z.string().trim().min(1).nullable(),
  closeDayReview: todayCloseDayReviewSchema,
  closedAt: nullableIsoTimestampSchema,
  cycleDate: isoDateSchema,
  id: z.string().trim().min(1).nullable(),
  operationalBoundary: todayOperationalBoundarySchema,
  pulses: z.object({
    active: todayActivePulseSchema.nullable(),
    history: z.array(todayPulseRecordSchema),
  }),
  regularization: todayRegularizationSchema,
  rollover: todayRolloverSchema,
  snapshot: todayCycleSnapshotSchema.nullable(),
  startedAt: nullableIsoTimestampSchema,
  state: z.enum(TODAY_SESSION_STATE_VALUES),
  taskScope: todayTaskScopeSchema,
  timeBlocks: z.array(todayTimeBlockSchema),
});

export const todayContractStatusSchema = z.object({
  auditTrailDecision: z.object({
    minimumMode: z.enum(TODAY_AUDIT_TRAIL_MODE_VALUES),
    rationale: z.string().trim().min(1),
    separateAuditTableRequired: z.boolean(),
  }),
  contractVersion: z.string().trim().min(1),
  notes: z.array(z.string().trim().min(1)).min(1),
  status: z.enum(TODAY_CONTRACT_STATUS_VALUES),
  targetSession: todaySessionSchema,
});

export type TodaySessionOutput = z.infer<typeof todaySessionSchema>;
export type TodayContractStatusOutput = z.infer<typeof todayContractStatusSchema>;