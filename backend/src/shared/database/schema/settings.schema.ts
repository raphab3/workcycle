import { boolean, index, pgTable, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';

import { users } from './users.schema';

export const userSettings = pgTable('user_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  timezone: varchar('timezone', { length: 120 }).notNull().default('UTC'),
  notificationsEnabled: boolean('notifications_enabled').notNull().default(false),
  dailyReviewTime: varchar('daily_review_time', { length: 5 }).notNull().default('18:00'),
  cycleStartHour: varchar('cycle_start_hour', { length: 5 }).notNull().default('00:00'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdIndex: index('user_settings_user_id_idx').on(table.userId),
  uniqueUserSettingsIndex: uniqueIndex('user_settings_user_id_key').on(table.userId),
}));

export type UserSettings = typeof userSettings.$inferSelect;
export type NewUserSettings = typeof userSettings.$inferInsert;