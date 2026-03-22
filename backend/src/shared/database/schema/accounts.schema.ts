import { boolean, index, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const googleAccounts = pgTable('google_accounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  displayName: varchar('display_name', { length: 255 }).notNull(),
  accessToken: text('access_token').notNull(),
  refreshToken: text('refresh_token').notNull(),
  tokenExpiresAt: timestamp('token_expires_at', { withTimezone: true }).notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const googleCalendars = pgTable('google_calendars', {
  id: text('id').primaryKey(),
  accountId: uuid('account_id').notNull().references(() => googleAccounts.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  colorHex: varchar('color_hex', { length: 32 }).notNull(),
  isIncluded: boolean('is_included').notNull().default(true),
  isPrimary: boolean('is_primary').notNull().default(false),
  syncedAt: timestamp('synced_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  accountIdIndex: index('google_calendars_account_id_idx').on(table.accountId),
}));

export type GoogleAccount = typeof googleAccounts.$inferSelect;
export type NewGoogleAccount = typeof googleAccounts.$inferInsert;
export type GoogleCalendar = typeof googleCalendars.$inferSelect;
export type NewGoogleCalendar = typeof googleCalendars.$inferInsert;