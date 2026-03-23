import type { Project, WeekDay } from '@/modules/projects/types';
import type { Task } from '@/modules/tasks/types';
import { getProjectLoadSummary } from '@/modules/tasks/utils/tasks';
import { buildSuggestedAllocations, createActualHoursMap, formatHours, getDefaultCycleValues, mergeActualHoursWithAllocations } from '@/modules/today/utils/planner';
import type { SuggestedAllocation, TodayCycleValues } from '@/modules/today/types';

import type { WeeklyDayCell, WeeklyDeviationStatus, WeeklyProjectRow, WeeklyScenario } from '../types';

const weekDays: WeekDay[] = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'];
const currentDay: WeekDay = 'Qua';

interface BuildWeeklyScenarioParams {
  projects: Project[];
  tasks: Task[];
  cycleValues?: TodayCycleValues;
  actualHours?: Record<string, number>;
}

function roundToHalf(value: number) {
  return Math.round(value * 2) / 2;
}

export function getWeeklyDeviationStatus(deltaHours: number): WeeklyDeviationStatus {
  const absoluteDelta = Math.abs(deltaHours);

  if (absoluteDelta <= 0.5) {
    return 'balanced';
  }

  if (absoluteDelta <= 2) {
    return 'attention';
  }

  return 'critical';
}

export function formatWeeklyCell(cell: WeeklyDayCell) {
  if (cell.plannedHours === 0 && cell.actualHours === 0) {
    return '-';
  }

  return `${formatHours(cell.actualHours)} / ${formatHours(cell.plannedHours)}`;
}

export function buildAdjustedActualHours(allocations: SuggestedAllocation[]) {
  const baseHours = createActualHoursMap(allocations);

  if (baseHours['cliente-core'] !== undefined) {
    baseHours['cliente-core'] = roundToHalf(baseHours['cliente-core'] + 0.5);
  }

  if (baseHours.fintrack !== undefined) {
    baseHours.fintrack = roundToHalf(Math.max(0, baseHours.fintrack - 0.5));
  }

  if (baseHours.datavault !== undefined) {
    baseHours.datavault = roundToHalf(baseHours.datavault + 1);
  }

  return baseHours;
}

function buildFixedCells(allocation: SuggestedAllocation, project: Project, actualTodayHours: number) {
  return weekDays.map((day) => {
    const isPlannedDay = project.fixedDays.includes(day);
    const plannedHours = isPlannedDay ? allocation.plannedHours : 0;
    const actualHours = day === currentDay && isPlannedDay ? actualTodayHours : plannedHours;

    return {
      day,
      plannedHours,
      actualHours,
    };
  });
}

function buildRotativeCells(allocation: SuggestedAllocation, actualTodayHours: number, index: number) {
  const patterns: WeekDay[][] = [
    ['Seg', 'Qua', 'Sex'],
    ['Ter', 'Qui', 'Sab'],
    ['Seg', 'Ter', 'Qui'],
  ];
  const selectedDays = patterns[index % patterns.length] ?? patterns[0];

  return weekDays.map((day) => {
    const isPlannedDay = selectedDays.includes(day);
    const plannedHours = isPlannedDay ? allocation.plannedHours : 0;
    const actualHours = day === currentDay && isPlannedDay ? actualTodayHours : plannedHours;

    return {
      day,
      plannedHours,
      actualHours,
    };
  });
}

export function buildWeeklyScenario({ projects, tasks, cycleValues, actualHours }: BuildWeeklyScenarioParams): WeeklyScenario {
  const activeProjects = projects.filter((project) => project.status === 'active');
  const projectLoadSummary = getProjectLoadSummary(tasks, activeProjects);
  const allocations = buildSuggestedAllocations(activeProjects, projectLoadSummary, cycleValues ?? getDefaultCycleValues(projects));
  const adjustedActualHours = actualHours
    ? mergeActualHoursWithAllocations(actualHours, allocations)
    : buildAdjustedActualHours(allocations);
  let rotativeIndex = 0;

  const rows: WeeklyProjectRow[] = allocations.map((allocation) => {
    const project = activeProjects.find((candidate) => candidate.id === allocation.projectId);
    const actualTodayHours = adjustedActualHours[allocation.projectId] ?? allocation.plannedHours;
    const cells = allocation.kind === 'fixed' && project
      ? buildFixedCells(allocation, project, actualTodayHours)
      : buildRotativeCells(allocation, actualTodayHours, rotativeIndex++);
    const plannedWeekHours = cells.reduce((total, cell) => total + cell.plannedHours, 0);
    const actualWeekHours = cells.reduce((total, cell) => total + cell.actualHours, 0);
    const deltaHours = roundToHalf(actualWeekHours - plannedWeekHours);

    return {
      projectId: allocation.projectId,
      projectName: allocation.projectName,
      colorHex: allocation.colorHex,
      plannedWeekHours,
      actualWeekHours,
      deltaHours,
      status: getWeeklyDeviationStatus(deltaHours),
      cells,
    };
  });

  return {
    rows,
    summary: {
      plannedWeekHours: rows.reduce((total, row) => total + row.plannedWeekHours, 0),
      actualWeekHours: rows.reduce((total, row) => total + row.actualWeekHours, 0),
      criticalProjects: rows.filter((row) => row.status === 'critical').length,
      attentionProjects: rows.filter((row) => row.status === 'attention').length,
    },
  };
}