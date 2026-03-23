import { z } from 'zod';

import { WEEKLY_DAY_VALUES, WEEKLY_DEVIATION_STATUS_VALUES, WEEKLY_SNAPSHOT_SOURCE_VALUES } from '@/modules/weekly/types/weekly';

const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use o formato YYYY-MM-DD.');
const isoTimestampSchema = z.string().datetime({ offset: true });
const weekKeySchema = z.string().regex(/^\d{4}-W\d{2}$/, 'Use o formato YYYY-WNN para weekKey.');

export const weeklyDayCellSchema = z.object({
  actualHours: z.number().min(0),
  date: isoDateSchema,
  day: z.enum(WEEKLY_DAY_VALUES),
  isProvisional: z.boolean(),
  plannedHours: z.number().min(0),
});

export const weeklyProjectRowSchema = z.object({
  actualWeekHours: z.number().min(0),
  cells: z.array(weeklyDayCellSchema),
  colorHex: z.string().trim().min(1),
  deltaHours: z.number(),
  plannedWeekHours: z.number().min(0),
  projectId: z.string().trim().min(1),
  projectName: z.string().trim().min(1),
  status: z.enum(WEEKLY_DEVIATION_STATUS_VALUES),
});

export const weeklySummaryMetricsSchema = z.object({
  actualWeekHours: z.number().min(0),
  attentionProjects: z.number().int().min(0),
  criticalProjects: z.number().int().min(0),
  plannedWeekHours: z.number().min(0),
});

export const weeklySnapshotResponseSchema = z.object({
  generatedAt: isoTimestampSchema,
  isFinal: z.boolean(),
  rows: z.array(weeklyProjectRowSchema),
  source: z.enum(WEEKLY_SNAPSHOT_SOURCE_VALUES),
  summary: weeklySummaryMetricsSchema,
  timezone: z.string().trim().min(1).max(120),
  weekEndsAt: isoDateSchema,
  weekKey: weekKeySchema,
  weekStartsAt: isoDateSchema,
});

export const weeklyHistoryResponseSchema = z.object({
  snapshots: z.array(weeklySnapshotResponseSchema),
});

export const getWeeklySnapshotQuerySchema = z.object({
  weekKey: weekKeySchema.optional(),
});

export const getWeeklyHistoryQuerySchema = z.object({
  fromWeekKey: weekKeySchema.optional(),
  limit: z.coerce.number().int().min(1).max(12).optional(),
  toWeekKey: weekKeySchema.optional(),
}).refine((input) => !(input.fromWeekKey && input.toWeekKey) || input.fromWeekKey <= input.toWeekKey, {
  message: 'fromWeekKey precisa ser menor ou igual a toWeekKey.',
});

export type WeeklySnapshotResponse = z.infer<typeof weeklySnapshotResponseSchema>;
export type WeeklyHistoryResponse = z.infer<typeof weeklyHistoryResponseSchema>;
export type GetWeeklySnapshotQuery = z.infer<typeof getWeeklySnapshotQuerySchema>;
export type GetWeeklyHistoryQuery = z.infer<typeof getWeeklyHistoryQuerySchema>;