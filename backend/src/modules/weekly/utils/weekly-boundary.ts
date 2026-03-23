import type { WeeklyDay } from '@/modules/weekly/types/weekly';

const weeklyDayLabels: WeeklyDay[] = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'];

function parseIsoDate(isoDate: string) {
  const [year, month, day] = isoDate.split('-').map(Number);

  return new Date(Date.UTC(year ?? 1970, (month ?? 1) - 1, day ?? 1));
}

export function toIsoDate(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
}

export function addDays(isoDate: string, days: number) {
  const date = parseIsoDate(isoDate);

  date.setUTCDate(date.getUTCDate() + days);

  return toIsoDate(date);
}

function getIsoDayOfWeek(isoDate: string) {
  const dayOfWeek = parseIsoDate(isoDate).getUTCDay();

  return dayOfWeek === 0 ? 7 : dayOfWeek;
}

function getWeekKeyFromDate(isoDate: string) {
  const date = parseIsoDate(isoDate);
  const day = date.getUTCDay() || 7;

  date.setUTCDate(date.getUTCDate() + 4 - day);

  const weekYear = date.getUTCFullYear();
  const yearStart = new Date(Date.UTC(weekYear, 0, 1));
  const weekNumber = Math.ceil((((date.getTime() - yearStart.getTime()) / 86_400_000) + 1) / 7);

  return `${weekYear}-W${String(weekNumber).padStart(2, '0')}`;
}

export function getWeekDayLabel(isoDate: string): WeeklyDay {
  return weeklyDayLabels[getIsoDayOfWeek(isoDate) - 1] ?? 'Seg';
}

export function getWeekInfoFromDate(isoDate: string) {
  const isoDayOfWeek = getIsoDayOfWeek(isoDate);
  const weekStartsAt = addDays(isoDate, 1 - isoDayOfWeek);
  const weekEndsAt = addDays(weekStartsAt, 6);
  const dates = Array.from({ length: 7 }, (_, index) => addDays(weekStartsAt, index));

  return {
    dates,
    weekEndsAt,
    weekKey: getWeekKeyFromDate(isoDate),
    weekStartsAt,
  };
}

export function getWeekInfoFromWeekKey(weekKey: string) {
  const [yearValue, weekValue] = weekKey.split('-W');
  const year = Number(yearValue);
  const week = Number(weekValue);
  const januaryFourth = new Date(Date.UTC(year, 0, 4));
  const januaryFourthDay = januaryFourth.getUTCDay() || 7;
  const weekOneMonday = new Date(januaryFourth);

  weekOneMonday.setUTCDate(januaryFourth.getUTCDate() - januaryFourthDay + 1 + ((week - 1) * 7));

  const weekStartsAt = toIsoDate(weekOneMonday);
  const weekEndsAt = addDays(weekStartsAt, 6);
  const dates = Array.from({ length: 7 }, (_, index) => addDays(weekStartsAt, index));

  return {
    dates,
    weekEndsAt,
    weekKey,
    weekStartsAt,
  };
}

export function listWeekKeysInRange(fromWeekKey: string, toWeekKey: string) {
  const weekKeys: string[] = [];
  let cursor = getWeekInfoFromWeekKey(fromWeekKey);

  while (cursor.weekKey <= toWeekKey) {
    weekKeys.push(cursor.weekKey);
    cursor = getWeekInfoFromDate(addDays(cursor.weekStartsAt, 7));
  }

  return weekKeys;
}

export function getPreviousWeekKey(weekKey: string, weeks = 1) {
  const weekInfo = getWeekInfoFromWeekKey(weekKey);

  return getWeekInfoFromDate(addDays(weekInfo.weekStartsAt, -7 * weeks)).weekKey;
}