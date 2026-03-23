import type { TodayOperationalBoundaryDTO } from '@/modules/cycle/types/today';

interface OperationalBoundaryConfig {
  cycleStartHour: string;
  timezone: string;
}

interface TimeZoneParts {
  day: number;
  hour: number;
  minute: number;
  month: number;
  year: number;
}

const timeZoneFormatterCache = new Map<string, Intl.DateTimeFormat>();

function getTimeZoneFormatter(timezone: string) {
  const cacheKey = timezone;

  if (!timeZoneFormatterCache.has(cacheKey)) {
    timeZoneFormatterCache.set(cacheKey, new Intl.DateTimeFormat('en-CA', {
      hour: '2-digit',
      hour12: false,
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      timeZone: timezone,
      year: 'numeric',
    }));
  }

  return timeZoneFormatterCache.get(cacheKey)!;
}

function getTimeZoneParts(referenceAt: Date, timezone: string): TimeZoneParts {
  const parts = getTimeZoneFormatter(timezone).formatToParts(referenceAt);

  return {
    day: Number(parts.find((part) => part.type === 'day')?.value ?? '1'),
    hour: Number(parts.find((part) => part.type === 'hour')?.value ?? '0'),
    minute: Number(parts.find((part) => part.type === 'minute')?.value ?? '0'),
    month: Number(parts.find((part) => part.type === 'month')?.value ?? '1'),
    year: Number(parts.find((part) => part.type === 'year')?.value ?? '1970'),
  };
}

function toIsoDate(parts: Pick<TimeZoneParts, 'day' | 'month' | 'year'>) {
  return `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`;
}

function addDays(isoDate: string, days: number) {
  const [year, month, day] = isoDate.split('-').map(Number);
  const nextDate = new Date(Date.UTC(year ?? 1970, (month ?? 1) - 1, (day ?? 1) + days));

  return `${nextDate.getUTCFullYear()}-${String(nextDate.getUTCMonth() + 1).padStart(2, '0')}-${String(nextDate.getUTCDate()).padStart(2, '0')}`;
}

function parseTimeValue(timeValue: string) {
  const [hours, minutes] = timeValue.split(':').map(Number);

  return {
    hours: hours ?? 0,
    minutes: minutes ?? 0,
  };
}

export function getZonedDateTimeUtc(isoDate: string, timeValue: string, timezone: string) {
  const [year, month, day] = isoDate.split('-').map(Number);
  const { hours, minutes } = parseTimeValue(timeValue);
  const utcGuess = new Date(Date.UTC(year ?? 1970, (month ?? 1) - 1, day ?? 1, hours, minutes, 0, 0));
  const zonedGuess = getTimeZoneParts(utcGuess, timezone);
  const desiredMinutes = Date.UTC(year ?? 1970, (month ?? 1) - 1, day ?? 1, hours, minutes, 0, 0);
  const currentMinutes = Date.UTC(zonedGuess.year, zonedGuess.month - 1, zonedGuess.day, zonedGuess.hour, zonedGuess.minute, 0, 0);
  const correctionMs = desiredMinutes - currentMinutes;

  return new Date(utcGuess.getTime() + correctionMs);
}

export function resolveOperationalCycleDate(referenceAt: string | Date, config: OperationalBoundaryConfig) {
  const now = typeof referenceAt === 'string' ? new Date(referenceAt) : referenceAt;
  const parts = getTimeZoneParts(now, config.timezone);
  const { hours, minutes } = parseTimeValue(config.cycleStartHour);
  const currentIsoDate = toIsoDate(parts);
  const currentMinutes = parts.hour * 60 + parts.minute;
  const boundaryMinutes = hours * 60 + minutes;

  if (currentMinutes < boundaryMinutes) {
    return addDays(currentIsoDate, -1);
  }

  return currentIsoDate;
}

export function buildOperationalBoundary(cycleDate: string, config: OperationalBoundaryConfig): TodayOperationalBoundaryDTO {
  const boundaryStartsAt = getZonedDateTimeUtc(cycleDate, config.cycleStartHour, config.timezone);
  const rolloverWindowStart = new Date(boundaryStartsAt.getTime() + (24 * 60 - 5) * 60_000);
  const rolloverWindowEnd = new Date(boundaryStartsAt.getTime() + (24 * 60 + 5) * 60_000);

  return {
    boundaryStartsAt: boundaryStartsAt.toISOString(),
    cycleStartHour: config.cycleStartHour,
    rolloverWindow: {
      endsAt: rolloverWindowEnd.toISOString(),
      startsAt: rolloverWindowStart.toISOString(),
    },
    timezone: config.timezone,
  };
}

export function getPulseWindowKey(firedAt: string) {
  const epochMs = new Date(firedAt).getTime();
  const pulseBucketMs = 30 * 60_000;

  return `pulse-${Math.floor(epochMs / pulseBucketMs)}`;
}