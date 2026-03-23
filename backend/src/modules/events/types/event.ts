import type { NewCalendarEvent } from '@/shared/database/schema';

export interface ListCalendarEventsInputDTO {
  accountIds?: string[];
  calendarIds?: string[];
  from: string;
  refresh: boolean;
  to: string;
}

export interface DegradedSourceDTO {
  accountId: string;
  calendarId?: string;
  reason: string;
}

export interface CalendarEventListRow {
  accountDisplayName: string;
  accountEmail: string;
  accountId: string;
  attendees: Array<Record<string, unknown>>;
  calendarColorHex: string;
  calendarId: string;
  calendarName: string;
  description: string | null;
  endAt: Date;
  id: string;
  isAllDay: boolean;
  location: string | null;
  meetLink: string | null;
  projectId: string | null;
  recurrenceRule: string | null;
  recurringEventId: string | null;
  responseStatus: 'accepted' | 'declined' | 'tentative' | 'needsAction';
  startAt: Date;
  syncedAt: Date;
  title: string;
  updatedAt: Date;
}

export interface CalendarEventResponseDTO {
  accountDisplayName: string;
  accountEmail: string;
  accountId: string;
  attendees: Array<Record<string, unknown>>;
  calendarColorHex: string;
  calendarId: string;
  calendarName: string;
  description: string | null;
  endAt: string;
  id: string;
  isAllDay: boolean;
  location: string | null;
  meetLink: string | null;
  projectId: string | null;
  recurrenceRule: string | null;
  recurringEventId: string | null;
  responseStatus: 'accepted' | 'declined' | 'tentative' | 'needsAction';
  startAt: string;
  syncedAt: string;
  title: string;
  updatedAt: string;
}

export interface ListCalendarEventsResultDTO {
  degradedSources: DegradedSourceDTO[];
  events: CalendarEventResponseDTO[];
}

export interface GoogleCalendarOperationalSource {
  accountAccessToken: string;
  accountDisplayName?: string;
  accountEmail?: string;
  accountId: string;
  accountIsActive: boolean;
  accountRefreshToken: string;
  accountTokenExpiresAt: Date;
  calendarColorHex?: string;
  calendarId: string;
  calendarIsPrimary?: boolean;
  calendarName?: string;
}

export interface RemoteGoogleCalendarEvent {
  attendees?: Array<Record<string, unknown> & { responseStatus?: 'accepted' | 'declined' | 'tentative' | 'needsAction'; self?: boolean }>;
  creator?: { self?: boolean };
  description?: string;
  end?: { date?: string; dateTime?: string };
  hangoutLink?: string;
  id: string;
  location?: string;
  organizer?: { self?: boolean };
  recurrence?: string[];
  recurringEventId?: string;
  start?: { date?: string; dateTime?: string };
  status?: string;
  summary?: string;
}

export interface GoogleCalendarEventsResponse {
  items?: RemoteGoogleCalendarEvent[];
  nextPageToken?: string;
}

export function toCalendarEventResponse(rows: CalendarEventListRow[]): CalendarEventResponseDTO[] {
  return rows.map((row) => ({
    accountDisplayName: row.accountDisplayName,
    accountEmail: row.accountEmail,
    accountId: row.accountId,
    attendees: row.attendees,
    calendarColorHex: row.calendarColorHex,
    calendarId: row.calendarId,
    calendarName: row.calendarName,
    description: row.description,
    endAt: row.endAt.toISOString(),
    id: row.id,
    isAllDay: row.isAllDay,
    location: row.location,
    meetLink: row.meetLink,
    projectId: row.projectId,
    recurrenceRule: row.recurrenceRule,
    recurringEventId: row.recurringEventId,
    responseStatus: row.responseStatus,
    startAt: row.startAt.toISOString(),
    syncedAt: row.syncedAt.toISOString(),
    title: row.title,
    updatedAt: row.updatedAt.toISOString(),
  }));
}

export type PersistedCalendarEventInput = NewCalendarEvent;