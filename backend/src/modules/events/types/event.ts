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
  accountDisplayName: string;
  accountEmail: string;
  accountId: string;
  accountIsActive: boolean;
  accountRefreshToken: string;
  accountTokenExpiresAt: Date;
  calendarColorHex: string;
  calendarId: string;
  calendarIsIncluded?: boolean;
  calendarIsPrimary?: boolean;
  calendarName: string;
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

export interface DeleteCalendarEventResultDTO {
  deleted: true;
  id: string;
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

function resolveGoogleDate(value: { date?: string; dateTime?: string } | undefined) {
  if (!value) {
    throw new Error('Google Calendar event payload is missing a date boundary.');
  }

  if (value.dateTime) {
    return new Date(value.dateTime);
  }

  if (value.date) {
    return new Date(`${value.date}T00:00:00.000Z`);
  }

  throw new Error('Google Calendar event payload is missing a valid date or datetime field.');
}

function resolveResponseStatus(event: RemoteGoogleCalendarEvent): 'accepted' | 'declined' | 'tentative' | 'needsAction' {
  const selfAttendee = event.attendees?.find((attendee) => attendee.self);

  if (
    selfAttendee?.responseStatus === 'accepted'
    || selfAttendee?.responseStatus === 'declined'
    || selfAttendee?.responseStatus === 'tentative'
    || selfAttendee?.responseStatus === 'needsAction'
  ) {
    return selfAttendee.responseStatus;
  }

  if (event.creator?.self || event.organizer?.self) {
    return 'accepted';
  }

  return 'needsAction';
}

export function toPersistedCalendarEvent(source: GoogleCalendarOperationalSource, event: RemoteGoogleCalendarEvent, syncedAt: Date): NewCalendarEvent {
  return {
    attendees: event.attendees ?? [],
    calendarId: source.calendarId,
    description: event.description ?? null,
    endAt: resolveGoogleDate(event.end),
    id: toLocalCalendarEventId(source.calendarId, event.id),
    isAllDay: Boolean(event.start?.date && event.end?.date),
    location: event.location ?? null,
    meetLink: event.hangoutLink ?? null,
    projectId: null,
    recurrenceRule: event.recurrence?.join('\n') ?? null,
    recurringEventId: event.recurringEventId ?? null,
    responseStatus: resolveResponseStatus(event),
    startAt: resolveGoogleDate(event.start),
    syncedAt,
    title: event.summary?.trim() || 'Sem titulo',
  };
}

export function toLocalCalendarEventId(calendarId: string, remoteEventId: string) {
  return `${calendarId}:${remoteEventId}`;
}

export function toRemoteCalendarEventId(calendarId: string, localEventId: string) {
  const prefix = `${calendarId}:`;

  return localEventId.startsWith(prefix) ? localEventId.slice(prefix.length) : localEventId;
}

export type PersistedCalendarEventInput = NewCalendarEvent;