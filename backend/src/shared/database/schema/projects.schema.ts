import { index, integer, jsonb, pgEnum, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

import { users } from './users.schema';

export const projectTypeEnum = pgEnum('project_type', ['fixed', 'rotative']);
export const projectStatusEnum = pgEnum('project_status', ['active', 'paused']);

export const projects = pgTable(
  'projects',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    colorHex: varchar('color_hex', { length: 32 }).notNull(),
    allocationPct: integer('allocation_pct').notNull(),
    type: projectTypeEnum('type').notNull(),
    sprintDays: integer('sprint_days').notNull(),
    status: projectStatusEnum('status').notNull().default('active'),
    fixedDays: jsonb('fixed_days').notNull().$type<string[]>().default([]),
    fixedHoursPerDay: integer('fixed_hours_per_day').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  table => [
    index('projects_user_id_idx').on(table.userId),
  ],
);

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
