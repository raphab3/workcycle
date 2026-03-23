import type { GoogleAccountDTO } from '@/modules/auth/types';
import type { AgendaCalendarOption, AgendaEvent, AgendaEventFormValues, AgendaEventWritePayload, AgendaIntervalInput } from '@/modules/agenda/types';

function padValue(value: number) {
  return String(value).padStart(2, '0');
}

function isFiniteDate(value: string) {
  return Number.isFinite(Date.parse(value));
}

export function getLocalISODate(date: Date) {
  return `${date.getFullYear()}-${padValue(date.getMonth() + 1)}-${padValue(date.getDate())}`;
}

export function buildAgendaDayInterval(date: string): AgendaIntervalInput {
  const [year, month, day] = date.split('-').map(Number);
  const start = new Date(year ?? 0, (month ?? 1) - 1, day ?? 1, 0, 0, 0, 0);
  const end = new Date(year ?? 0, (month ?? 1) - 1, day ?? 1, 23, 59, 59, 999);

  return {
    from: start.toISOString(),
    to: end.toISOString(),
  };
}

export function shiftAgendaDate(date: string, deltaInDays: number) {
  const [year, month, day] = date.split('-').map(Number);
  const nextDate = new Date(year ?? 0, (month ?? 1) - 1, day ?? 1);
  nextDate.setDate(nextDate.getDate() + deltaInDays);

  return getLocalISODate(nextDate);
}

export function formatAgendaDayLabel(date: string) {
  const [year, month, day] = date.split('-').map(Number);
  const parsedDate = new Date(year ?? 0, (month ?? 1) - 1, day ?? 1);

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    weekday: 'long',
  }).format(parsedDate);
}

export function sortAgendaEvents(events: AgendaEvent[]) {
  return [...events].sort((left, right) => {
    const startDelta = new Date(left.startAt).getTime() - new Date(right.startAt).getTime();

    if (startDelta !== 0) {
      return startDelta;
    }

    return new Date(left.endAt).getTime() - new Date(right.endAt).getTime();
  });
}

export function formatAgendaTimeRange(event: AgendaEvent) {
  if (event.isAllDay) {
    return 'Dia inteiro';
  }

  const formatter = new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return `${formatter.format(new Date(event.startAt))} - ${formatter.format(new Date(event.endAt))}`;
}

export function formatAgendaDateTime(timestamp: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: '2-digit',
  }).format(new Date(timestamp));
}

export function toDatetimeLocalValue(timestamp: string) {
  if (!isFiniteDate(timestamp)) {
    return '';
  }

  const date = new Date(timestamp);

  return `${date.getFullYear()}-${padValue(date.getMonth() + 1)}-${padValue(date.getDate())}T${padValue(date.getHours())}:${padValue(date.getMinutes())}`;
}

export function toIsoFromDatetimeLocal(value: string) {
  return new Date(value).toISOString();
}

export function toAgendaEventWritePayload(values: AgendaEventFormValues): AgendaEventWritePayload {
  return {
    calendarId: values.calendarId,
    description: values.description?.trim() || undefined,
    endAt: toIsoFromDatetimeLocal(values.endAt),
    location: values.location?.trim() || undefined,
    startAt: toIsoFromDatetimeLocal(values.startAt),
    title: values.title.trim(),
  };
}

export function getIncludedAgendaCalendars(accounts: GoogleAccountDTO[]): AgendaCalendarOption[] {
  return accounts.flatMap((account) => account.calendars
    .filter((calendar) => calendar.isIncluded)
    .map((calendar) => ({
      accountDisplayName: account.displayName,
      accountId: account.id,
      calendarId: calendar.id,
      calendarName: calendar.name,
      colorHex: calendar.colorHex,
      isPrimary: calendar.isPrimary,
      label: `${calendar.name} · ${account.displayName}`,
      syncedAt: calendar.syncedAt,
    })));
}

export function isAgendaEventWithinInterval(event: AgendaEvent, interval: AgendaIntervalInput) {
  const intervalStart = new Date(interval.from).getTime();
  const intervalEnd = new Date(interval.to).getTime();
  const eventStart = new Date(event.startAt).getTime();
  const eventEnd = new Date(event.endAt).getTime();

  return eventEnd >= intervalStart && eventStart <= intervalEnd;
}

export function countUniqueAgendaCalendars(events: AgendaEvent[]) {
  return new Set(events.map((event) => event.calendarId)).size;
}