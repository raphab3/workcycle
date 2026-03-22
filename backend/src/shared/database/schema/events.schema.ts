import { boolean, index, integer, jsonb, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';

import { googleCalendars } from './accounts.schema';

export const eventResponseStatusEnum = pgEnum('event_response_status', ['accepted', 'declined', 'tentative', 'needsAction']);
export const accountingStatusEnum = pgEnum('accounting_status', ['pending', 'approved', 'ignored', 'silenced']);

export const calendarEvents = pgTable('calendar_events', {
  id: text('id').primaryKey(),
  calendarId: text('calendar_id').notNull().references(() => googleCalendars.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 512 }).notNull(),
  startAt: timestamp('start_at', { withTimezone: true }).notNull(),
  endAt: timestamp('end_at', { withTimezone: true }).notNull(),
  location: text('location'),
  description: text('description'),
  meetLink: text('meet_link'),
  recurrenceRule: text('recurrence_rule'),
  recurringEventId: text('recurring_event_id'),
  attendees: jsonb('attendees').notNull().$type<Array<Record<string, unknown>>>(),
  responseStatus: eventResponseStatusEnum('response_status').notNull().default('needsAction'),
  isAllDay: boolean('is_all_day').notNull().default(false),
  syncedAt: timestamp('synced_at', { withTimezone: true }).defaultNow().notNull(),
  projectId: text('project_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  calendarIdIndex: index('calendar_events_calendar_id_idx').on(table.calendarId),
  projectIdIndex: index('calendar_events_project_id_idx').on(table.projectId),
  recurringEventIdIndex: index('calendar_events_recurring_event_id_idx').on(table.recurringEventId),
  startAtIndex: index('calendar_events_start_at_idx').on(table.startAt),
}));

export const eventAccountingStatuses = pgTable('event_accounting_statuses', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventId: text('event_id').notNull().references(() => calendarEvents.id, { onDelete: 'cascade' }),
  date: varchar('date', { length: 10 }).notNull(),
  status: accountingStatusEnum('status').notNull().default('pending'),
  silencedEventId: text('silenced_event_id'),
  approvedMinutes: integer('approved_minutes'),
  projectId: text('project_id'),
  resolvedAt: timestamp('resolved_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  dateIndex: index('event_accounting_statuses_date_idx').on(table.date),
  projectIdIndex: index('event_accounting_statuses_project_id_idx').on(table.projectId),
  silencedEventIdIndex: index('event_accounting_statuses_silenced_event_id_idx').on(table.silencedEventId),
  uniqueEventDateIndex: uniqueIndex('event_accounting_statuses_event_id_date_key').on(table.eventId, table.date),
}));

export type CalendarEvent = typeof calendarEvents.$inferSelect;
export type NewCalendarEvent = typeof calendarEvents.$inferInsert;
export type EventAccountingStatus = typeof eventAccountingStatuses.$inferSelect;
export type NewEventAccountingStatus = typeof eventAccountingStatuses.$inferInsert;