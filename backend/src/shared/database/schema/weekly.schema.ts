import { boolean, index, jsonb, pgTable, timestamp, uniqueIndex, uuid, varchar, date } from 'drizzle-orm/pg-core';

import { users } from './users.schema';

import type { WeeklyDay, WeeklyDeviationStatus, WeeklySnapshotSource } from '@/modules/weekly/types/weekly';

interface PersistedWeeklyDayCell {
  actualHours: number;
  date: string;
  day: WeeklyDay;
  isProvisional: boolean;
  plannedHours: number;
}

interface PersistedWeeklyProjectRow {
  actualWeekHours: number;
  cells: PersistedWeeklyDayCell[];
  colorHex: string;
  deltaHours: number;
  plannedWeekHours: number;
  projectId: string;
  projectName: string;
  status: WeeklyDeviationStatus;
}

interface PersistedWeeklySnapshot {
  generatedAt: string;
  isFinal: boolean;
  rows: PersistedWeeklyProjectRow[];
  source: WeeklySnapshotSource;
  summary: {
    actualWeekHours: number;
    attentionProjects: number;
    criticalProjects: number;
    plannedWeekHours: number;
  };
  timezone: string;
  weekEndsAt: string;
  weekKey: string;
  weekStartsAt: string;
}

export const weeklySnapshots = pgTable(
  'weekly_snapshots',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    weekKey: varchar('week_key', { length: 8 }).notNull(),
    weekStartsAt: date('week_starts_at', { mode: 'string' }).notNull(),
    weekEndsAt: date('week_ends_at', { mode: 'string' }).notNull(),
    timezone: varchar('timezone', { length: 120 }).notNull(),
    isFinal: boolean('is_final').notNull().default(true),
    generatedAt: timestamp('generated_at', { withTimezone: true }).defaultNow().notNull(),
    snapshot: jsonb('snapshot').$type<PersistedWeeklySnapshot>().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('weekly_snapshots_user_id_idx').on(table.userId),
    index('weekly_snapshots_week_key_idx').on(table.weekKey),
    uniqueIndex('weekly_snapshots_user_id_week_key_key').on(table.userId, table.weekKey),
  ],
);

export type WeeklySnapshot = typeof weeklySnapshots.$inferSelect;
export type NewWeeklySnapshot = typeof weeklySnapshots.$inferInsert;