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

const todayTimeBlockWriteSchema = z.object({
  confirmedMinutes: z.number().int().min(0).default(0),
  endedAt: nullableIsoTimestampSchema.default(null),
  projectId: z.string().uuid(),
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

export const getTodaySessionQuerySchema = z.object({
  cycleDate: isoDateSchema.optional(),
});

export const listPulseRecordsQuerySchema = z.object({
  cycleDate: isoDateSchema.optional(),
  sessionId: z.string().uuid().optional(),
}).refine((input) => input.cycleDate !== undefined || input.sessionId !== undefined || true, {
  message: 'Pulse records query accepts an optional cycleDate or sessionId.',
});

export const updateTodaySessionSchema = z.object({
  activeProjectId: z.string().uuid().nullable().optional(),
  closedAt: nullableIsoTimestampSchema.optional(),
  cycleDate: isoDateSchema.optional(),
  rollover: z.object({
    carryOverInProgressTaskIds: z.array(z.string().uuid()).default([]),
    noticeDescription: z.string().trim().max(500).nullable().optional(),
    noticeTitle: z.string().trim().max(255).nullable().optional(),
    previousCycleDate: isoDateSchema.nullable().optional(),
    strategy: z.enum(TODAY_ROLLOVER_STRATEGY_VALUES),
    triggeredAt: nullableIsoTimestampSchema.optional(),
  }).optional(),
  sessionId: z.string().uuid().optional(),
  snapshot: todayCycleSnapshotSchema.nullable().optional(),
  startedAt: nullableIsoTimestampSchema.optional(),
  state: z.enum(TODAY_SESSION_STATE_VALUES).optional(),
  timeBlocks: z.array(todayTimeBlockWriteSchema).optional(),
}).refine((input) => Object.values(input).some((value) => value !== undefined), {
  message: 'At least one session field must be provided for update.',
});

export const upsertPulseRecordSchema = z.object({
  confirmedMinutes: z.number().int().min(0).max(30).default(0),
  expiresAt: isoTimestampSchema.optional(),
  firedAt: isoTimestampSchema,
  projectId: z.string().uuid().nullable().optional(),
  resolution: z.enum(TODAY_PULSE_RESOLUTION_VALUES),
  respondedAt: nullableIsoTimestampSchema.optional(),
  reviewedAt: nullableIsoTimestampSchema.optional(),
  sessionId: z.string().uuid(),
  status: z.enum(TODAY_PULSE_STATUS_VALUES),
});

export type TodaySessionOutput = z.infer<typeof todaySessionSchema>;
export type TodayContractStatusOutput = z.infer<typeof todayContractStatusSchema>;
export type GetTodaySessionQuery = z.infer<typeof getTodaySessionQuerySchema>;
export type ListPulseRecordsQuery = z.infer<typeof listPulseRecordsQuerySchema>;
export type UpdateTodaySessionInput = z.infer<typeof updateTodaySessionSchema>;
export type UpsertPulseRecordInput = z.infer<typeof upsertPulseRecordSchema>;