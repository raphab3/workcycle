import { relations } from 'drizzle-orm';
import {
  boolean,
  date,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

import { projects } from './projects.schema';
import { users } from './users.schema';

export const cycleSessionStateEnum = pgEnum('cycle_session_state', ['idle', 'running', 'paused_manual', 'paused_inactivity', 'completed']);
export const cycleRolloverStrategyEnum = pgEnum('cycle_rollover_strategy', ['auto-close-and-open-next', 'manual-start-next']);
export const taskPriorityEnum = pgEnum('task_priority', ['critical', 'high', 'medium', 'low']);
export const taskStatusEnum = pgEnum('task_status', ['todo', 'doing', 'blocked', 'done']);
export const taskCycleAssignmentEnum = pgEnum('task_cycle_assignment', ['backlog', 'current', 'next']);
export const taskBoardColumnEnum = pgEnum('task_board_column', ['backlog', 'in-progress', 'code-review', 'done']);

interface PersistedCycleSnapshot {
  actualHours: number;
  completedTaskIds: string[];
  incompleteTaskIds: string[];
  plannedHours: number;
}

export const cycleSessions = pgTable(
  'cycle_sessions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    activeProjectId: uuid('active_project_id').references(() => projects.id, { onDelete: 'set null' }),
    state: cycleSessionStateEnum('state').notNull().default('idle'),
    cycleDate: date('cycle_date', { mode: 'string' }).notNull(),
    startedAt: timestamp('started_at', { withTimezone: true }),
    closedAt: timestamp('closed_at', { withTimezone: true }),
    snapshot: jsonb('snapshot').$type<PersistedCycleSnapshot | null>(),
    previousCycleDate: date('previous_cycle_date', { mode: 'string' }),
    rolloverTriggeredAt: timestamp('rollover_triggered_at', { withTimezone: true }),
    rolloverStrategy: cycleRolloverStrategyEnum('rollover_strategy').notNull().default('manual-start-next'),
    rolloverNoticeTitle: varchar('rollover_notice_title', { length: 255 }),
    rolloverNoticeDescription: text('rollover_notice_description'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('cycle_sessions_user_id_idx').on(table.userId),
    index('cycle_sessions_active_project_id_idx').on(table.activeProjectId),
    index('cycle_sessions_previous_cycle_date_idx').on(table.previousCycleDate),
    uniqueIndex('cycle_sessions_user_id_cycle_date_key').on(table.userId, table.cycleDate),
  ],
);

export const tasks = pgTable(
  'tasks',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
    cycleSessionId: uuid('cycle_session_id').references(() => cycleSessions.id, { onDelete: 'set null' }),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    columnId: taskBoardColumnEnum('column_id').notNull().default('backlog'),
    priority: taskPriorityEnum('priority').notNull().default('medium'),
    status: taskStatusEnum('status').notNull().default('todo'),
    cycleAssignment: taskCycleAssignmentEnum('cycle_assignment').notNull().default('backlog'),
    dueDate: date('due_date', { mode: 'string' }),
    estimatedHours: doublePrecision('estimated_hours').notNull().default(0),
    isArchived: boolean('is_archived').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('tasks_user_id_idx').on(table.userId),
    index('tasks_project_id_idx').on(table.projectId),
    index('tasks_cycle_session_id_idx').on(table.cycleSessionId),
    index('tasks_user_id_column_id_idx').on(table.userId, table.columnId),
    index('tasks_user_id_cycle_assignment_idx').on(table.userId, table.cycleAssignment),
  ],
);

export const taskChecklistItems = pgTable(
  'task_checklist_items',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    taskId: uuid('task_id').notNull().references(() => tasks.id, { onDelete: 'cascade' }),
    label: varchar('label', { length: 255 }).notNull(),
    position: integer('position').notNull(),
    isDone: boolean('is_done').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('task_checklist_items_task_id_idx').on(table.taskId),
    uniqueIndex('task_checklist_items_task_id_position_key').on(table.taskId, table.position),
  ],
);

export const cycleSessionsRelations = relations(cycleSessions, ({ many, one }) => ({
  activeProject: one(projects, {
    fields: [cycleSessions.activeProjectId],
    references: [projects.id],
  }),
  tasks: many(tasks),
  user: one(users, {
    fields: [cycleSessions.userId],
    references: [users.id],
  }),
}));

export const tasksRelations = relations(tasks, ({ many, one }) => ({
  checklistItems: many(taskChecklistItems),
  cycleSession: one(cycleSessions, {
    fields: [tasks.cycleSessionId],
    references: [cycleSessions.id],
  }),
  project: one(projects, {
    fields: [tasks.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [tasks.userId],
    references: [users.id],
  }),
}));

export const taskChecklistItemsRelations = relations(taskChecklistItems, ({ one }) => ({
  task: one(tasks, {
    fields: [taskChecklistItems.taskId],
    references: [tasks.id],
  }),
}));

export type CycleSession = typeof cycleSessions.$inferSelect;
export type NewCycleSession = typeof cycleSessions.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type TaskChecklistItem = typeof taskChecklistItems.$inferSelect;
export type NewTaskChecklistItem = typeof taskChecklistItems.$inferInsert;