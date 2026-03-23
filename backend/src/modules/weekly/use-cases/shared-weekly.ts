import { buildWeeklySnapshot } from '@/modules/weekly/utils/weekly-consolidation';
import { getWeekInfoFromDate, getWeekInfoFromWeekKey } from '@/modules/weekly/utils/weekly-boundary';
import { resolveOperationalCycleDate } from '@/modules/cycle/utils/operational-boundary';

import type { WeeklyRepository } from '@/modules/weekly/repositories/weekly.repository';
import type { UserSettingsDTO } from '@/modules/settings/types/settings';

export async function buildWeeklySnapshotForWeek(params: {
  currentCycleDate: string;
  generatedAt: string;
  repository: WeeklyRepository;
  timezone: string;
  userId: string;
  weekKey: string;
}) {
  const weekInfo = params.weekKey === getWeekInfoFromDate(params.currentCycleDate).weekKey
    ? getWeekInfoFromDate(params.currentCycleDate)
    : getWeekInfoFromWeekKey(params.weekKey);
  const [projects, tasks, sessions] = await Promise.all([
    params.repository.listProjects(params.userId),
    params.repository.listTasks(params.userId),
    params.repository.listCycleSessionsForWeek(params.userId, weekInfo.weekStartsAt, weekInfo.weekEndsAt),
  ]);
  const timeBlocks = await params.repository.listTimeBlocksForSessions(sessions.map((session) => session.id));
  const isFinal = weekInfo.weekKey < getWeekInfoFromDate(params.currentCycleDate).weekKey;

  return buildWeeklySnapshot({
    currentCycleDate: params.currentCycleDate,
    generatedAt: params.generatedAt,
    isFinal,
    projects,
    sessions,
    tasks,
    timeBlocks,
    timezone: params.timezone,
    weekKey: weekInfo.weekKey,
  });
}

export function resolveCurrentCycleDate(referenceAt: string, settings: UserSettingsDTO) {
  return resolveOperationalCycleDate(referenceAt, {
    cycleStartHour: settings.cycleStartHour,
    timezone: settings.timezone,
  });
}