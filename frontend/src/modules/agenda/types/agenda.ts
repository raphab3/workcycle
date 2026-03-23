export interface AgendaIntervalInput {
  from: string;
  to: string;
}

export interface AgendaDegradedSource {
  accountId: string;
  calendarId?: string;
  reason: string;
}

export interface AgendaEvent {
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

export interface AgendaEventsResult {
  degradedSources: AgendaDegradedSource[];
  events: AgendaEvent[];
}

export interface AgendaEventFormValues {
  calendarId: string;
  description?: string;
  endAt: string;
  location?: string;
  startAt: string;
  title: string;
}

export interface AgendaEventWritePayload {
  calendarId: string;
  description?: string;
  endAt: string;
  location?: string;
  startAt: string;
  title: string;
}

export interface AgendaCalendarOption {
  accountDisplayName: string;
  accountId: string;
  calendarId: string;
  calendarName: string;
  colorHex: string;
  isPrimary: boolean;
  label: string;
  syncedAt: string | null;
}

export interface UpdateAgendaEventInput {
  eventId: string;
  values: AgendaEventWritePayload;
}

export interface DeleteAgendaEventInput {
  eventId: string;
}

export interface DeleteAgendaEventResult {
  deleted: true;
  id: string;
}