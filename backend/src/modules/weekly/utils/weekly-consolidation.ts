import { cycleSessionStateEnum, type CycleSession, type CycleTimeBlock, type Project, type Task } from '@/shared/database/schema';

import { addDays, getWeekDayLabel, getWeekInfoFromDate } from '@/modules/weekly/utils/weekly-boundary';

import type { WeeklyDay, WeeklyDayCellDTO, WeeklyProjectRowDTO, WeeklySnapshotResponseDTO } from '@/modules/weekly/types/weekly';

const DEFAULT_DAILY_AVAILABLE_HOURS = 10;
const DEFAULT_WEEKLY_ROTATIVE_CAPACITY_HOURS = 60;

const rotativePatterns: WeeklyDay[][] = [
  ['Seg', 'Qua', 'Sex'],
  ['Ter', 'Qui', 'Sab'],
  ['Seg', 'Ter', 'Qui'],
  ['Qua', 'Sex', 'Sab'],
];

function roundToHalf(value: number) {
  return Math.round(value * 2) / 2;
}

function getWeeklyDeviationStatus(deltaHours: number) {
  const absoluteDelta = Math.abs(deltaHours);

  if (absoluteDelta <= 0.5) {
    return 'balanced' as const;
  }

  if (absoluteDelta <= 2) {
    return 'attention' as const;
  }

  return 'critical' as const;
}

function buildProjectLoadSummary(tasks: Task[], projects: Project[]) {
  return projects.reduce<Record<string, { effortHours: number; openTasks: number }>>((accumulator, project) => {
    const projectTasks = tasks.filter((task) => task.projectId === project.id && task.isArchived === false && task.status !== 'done');

    accumulator[project.id] = {
      effortHours: projectTasks.reduce((total, task) => total + task.estimatedHours, 0),
      openTasks: projectTasks.length,
    };

    return accumulator;
  }, {});
}

function getRotativeScore(project: Project, projectLoad?: { effortHours: number; openTasks: number }) {
  if (!projectLoad) {
    return Math.max(1, project.allocationPct / 10);
  }

  return Math.max(1, project.allocationPct / 10 + projectLoad.effortHours + projectLoad.openTasks * 1.5);
}

function distributeHoursAcrossDays(plannedWeekHours: number, days: WeeklyDay[]) {
  if (days.length === 0 || plannedWeekHours <= 0) {
    return new Map<WeeklyDay, number>();
  }

  let remainingHours = roundToHalf(plannedWeekHours);
  const distribution = new Map<WeeklyDay, number>();

  days.forEach((day, index) => {
    const nextHours = index === days.length - 1 ? remainingHours : roundToHalf(remainingHours / (days.length - index));

    distribution.set(day, nextHours);
    remainingHours = roundToHalf(Math.max(0, remainingHours - nextHours));
  });

  return distribution;
}

function getBlockActualHours(block: CycleTimeBlock, session: CycleSession, referenceAt: string, currentCycleDate: string, isFinal: boolean) {
  if (isFinal || session.cycleDate < currentCycleDate || session.state === 'completed') {
    return roundToHalf(block.confirmedMinutes / 60);
  }

  const referenceTimestamp = block.endedAt ?? new Date(referenceAt);
  const trackedMinutes = Math.max(0, Math.round((referenceTimestamp.getTime() - block.startedAt.getTime()) / 60_000));

  return roundToHalf(trackedMinutes / 60);
}

interface BuildWeeklySnapshotParams {
  currentCycleDate: string;
  generatedAt: string;
  isFinal: boolean;
  projects: Project[];
  sessions: CycleSession[];
  tasks: Task[];
  timeBlocks: CycleTimeBlock[];
  timezone: string;
  weekKey: string;
}

export function buildWeeklySnapshot(params: BuildWeeklySnapshotParams): WeeklySnapshotResponseDTO {
  const weekInfo = getWeekInfoFromDate(params.sessions[0]?.cycleDate ?? params.currentCycleDate);
  const projectLoadSummary = buildProjectLoadSummary(params.tasks, params.projects);
  const sessionMap = new Map(params.sessions.map((session) => [session.id, session]));
  const actualHoursByProjectDate = new Map<string, number>();
  const provisionalDates = new Set<string>();

  params.timeBlocks.forEach((block) => {
    const session = sessionMap.get(block.cycleSessionId);

    if (!session) {
      return;
    }

    const key = `${block.projectId}:${session.cycleDate}`;
    const currentHours = actualHoursByProjectDate.get(key) ?? 0;
    const blockHours = getBlockActualHours(block, session, params.generatedAt, params.currentCycleDate, params.isFinal);

    actualHoursByProjectDate.set(key, roundToHalf(currentHours + blockHours));

    if (!params.isFinal && session.cycleDate === params.currentCycleDate && session.state !== 'completed') {
      provisionalDates.add(session.cycleDate);
    }
  });

  const activeProjects = params.projects.filter((project) => project.status === 'active');
  const fixedProjects = activeProjects.filter((project) => project.type === 'fixed');
  const rotativeProjects = activeProjects.filter((project) => project.type === 'rotative').sort((left, right) => (
    getRotativeScore(right, projectLoadSummary[right.id]) - getRotativeScore(left, projectLoadSummary[left.id])
  ));

  const plannedHoursByProjectDate = new Map<string, number>();
  let fixedHoursTotal = 0;

  fixedProjects.forEach((project) => {
    weekInfo.dates.forEach((date) => {
      const day = getWeekDayLabel(date);

      if (!project.fixedDays.includes(day)) {
        return;
      }

      const hours = roundToHalf(project.fixedHoursPerDay);

      fixedHoursTotal += hours;
      plannedHoursByProjectDate.set(`${project.id}:${date}`, hours);
    });
  });

  const remainingHours = Math.max(DEFAULT_WEEKLY_ROTATIVE_CAPACITY_HOURS - fixedHoursTotal, 0);
  const scoreSum = rotativeProjects.reduce((total, project) => total + getRotativeScore(project, projectLoadSummary[project.id]), 0);
  let remainingRotativeHours = remainingHours;

  rotativeProjects.forEach((project, index) => {
    const rawPlannedWeekHours = index === rotativeProjects.length - 1
      ? remainingRotativeHours
      : (remainingHours * getRotativeScore(project, projectLoadSummary[project.id])) / Math.max(scoreSum, 1);
    const plannedWeekHours = roundToHalf(rawPlannedWeekHours);
    const pattern = rotativePatterns[index % rotativePatterns.length] ?? rotativePatterns[0];
    const distributedHours = distributeHoursAcrossDays(plannedWeekHours, pattern);

    remainingRotativeHours = roundToHalf(Math.max(0, remainingRotativeHours - plannedWeekHours));

    weekInfo.dates.forEach((date) => {
      const day = getWeekDayLabel(date);
      const plannedHours = distributedHours.get(day) ?? 0;

      if (plannedHours <= 0) {
        return;
      }

      plannedHoursByProjectDate.set(`${project.id}:${date}`, plannedHours);
    });
  });

  const relevantProjectIds = new Set<string>([
    ...params.projects.filter((project) => project.status === 'active').map((project) => project.id),
    ...Array.from(actualHoursByProjectDate.keys()).map((key) => key.split(':')[0] ?? ''),
    ...Array.from(plannedHoursByProjectDate.keys()).map((key) => key.split(':')[0] ?? ''),
  ]);

  const rows: WeeklyProjectRowDTO[] = params.projects
    .filter((project) => relevantProjectIds.has(project.id))
    .map((project) => {
      const cells: WeeklyDayCellDTO[] = weekInfo.dates.map((date) => ({
        actualHours: actualHoursByProjectDate.get(`${project.id}:${date}`) ?? 0,
        date,
        day: getWeekDayLabel(date),
        isProvisional: provisionalDates.has(date),
        plannedHours: plannedHoursByProjectDate.get(`${project.id}:${date}`) ?? 0,
      }));
      const plannedWeekHours = roundToHalf(cells.reduce((total, cell) => total + cell.plannedHours, 0));
      const actualWeekHours = roundToHalf(cells.reduce((total, cell) => total + cell.actualHours, 0));
      const deltaHours = roundToHalf(actualWeekHours - plannedWeekHours);

      return {
        actualWeekHours,
        cells,
        colorHex: project.colorHex,
        deltaHours,
        plannedWeekHours,
        projectId: project.id,
        projectName: project.name,
        status: getWeeklyDeviationStatus(deltaHours),
      };
    })
    .filter((row) => row.actualWeekHours > 0 || row.plannedWeekHours > 0)
    .sort((left, right) => right.actualWeekHours + right.plannedWeekHours - (left.actualWeekHours + left.plannedWeekHours));

  return {
    generatedAt: params.generatedAt,
    isFinal: params.isFinal,
    rows,
    source: params.isFinal ? 'persisted-weekly-history' : 'derived-open-week',
    summary: {
      actualWeekHours: roundToHalf(rows.reduce((total, row) => total + row.actualWeekHours, 0)),
      attentionProjects: rows.filter((row) => row.status === 'attention').length,
      criticalProjects: rows.filter((row) => row.status === 'critical').length,
      plannedWeekHours: roundToHalf(rows.reduce((total, row) => total + row.plannedWeekHours, 0)),
    },
    timezone: params.timezone,
    weekEndsAt: weekInfo.weekEndsAt,
    weekKey: params.weekKey,
    weekStartsAt: weekInfo.weekStartsAt,
  };
}

export function getWeeklySnapshotInputsForWeek(weekKey: string, currentCycleDate: string) {
  const targetWeek = getWeekInfoFromDate(currentCycleDate).weekKey === weekKey
    ? getWeekInfoFromDate(currentCycleDate)
    : (() => {
      const weekStartsAt = addDays(getWeekInfoFromDate(currentCycleDate).weekStartsAt, 0);

      void weekStartsAt;
      return null;
    })();

  return targetWeek;
}