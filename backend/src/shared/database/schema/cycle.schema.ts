import { relations } from 'drizzle-orm';
import {
  index,
  integer,
  pgEnum,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

import { projects } from './projects.schema';
import { cycleSessions } from './tasks.schema';
import { users } from './users.schema';

export const pulseRecordStatusEnum = pgEnum('pulse_record_status', ['confirmed', 'unconfirmed']);
export const pulseRecordResolutionEnum = pgEnum('pulse_record_resolution', ['pending', 'confirmed', 'inactive']);

export const cycleTimeBlocks = pgTable(
  'cycle_time_blocks',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    cycleSessionId: uuid('cycle_session_id').notNull().references(() => cycleSessions.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
    startedAt: timestamp('started_at', { withTimezone: true }).notNull(),
    endedAt: timestamp('ended_at', { withTimezone: true }),
    confirmedMinutes: integer('confirmed_minutes').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('cycle_time_blocks_cycle_session_id_idx').on(table.cycleSessionId),
    index('cycle_time_blocks_user_id_idx').on(table.userId),
    index('cycle_time_blocks_project_id_idx').on(table.projectId),
  ],
);

export const pulseRecords = pgTable(
  'pulse_records',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    cycleSessionId: uuid('cycle_session_id').notNull().references(() => cycleSessions.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    projectId: uuid('project_id').references(() => projects.id, { onDelete: 'set null' }),
    windowKey: varchar('window_key', { length: 80 }).notNull(),
    firedAt: timestamp('fired_at', { withTimezone: true }).notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    respondedAt: timestamp('responded_at', { withTimezone: true }),
    status: pulseRecordStatusEnum('status').notNull(),
    resolution: pulseRecordResolutionEnum('resolution').notNull().default('pending'),
    reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
    confirmedMinutes: integer('confirmed_minutes').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('pulse_records_cycle_session_id_idx').on(table.cycleSessionId),
    index('pulse_records_user_id_idx').on(table.userId),
    uniqueIndex('pulse_records_cycle_session_window_key_key').on(table.cycleSessionId, table.windowKey),
  ],
);

export const cycleTimeBlocksRelations = relations(cycleTimeBlocks, ({ one }) => ({
  cycleSession: one(cycleSessions, {
    fields: [cycleTimeBlocks.cycleSessionId],
    references: [cycleSessions.id],
  }),
  project: one(projects, {
    fields: [cycleTimeBlocks.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [cycleTimeBlocks.userId],
    references: [users.id],
  }),
}));

export const pulseRecordsRelations = relations(pulseRecords, ({ one }) => ({
  cycleSession: one(cycleSessions, {
    fields: [pulseRecords.cycleSessionId],
    references: [cycleSessions.id],
  }),
  project: one(projects, {
    fields: [pulseRecords.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [pulseRecords.userId],
    references: [users.id],
  }),
}));

export type CycleTimeBlock = typeof cycleTimeBlocks.$inferSelect;
export type NewCycleTimeBlock = typeof cycleTimeBlocks.$inferInsert;
export type PulseRecord = typeof pulseRecords.$inferSelect;
export type NewPulseRecord = typeof pulseRecords.$inferInsert;