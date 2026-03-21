import type { Project } from '@/modules/projects/types';
import type { ProjectTaskLoad } from '@/modules/tasks/types';

import type { SuggestedAllocation, TodayCycleValues } from '@/modules/today/types';

function roundToHalf(value: number) {
  return Math.round(value * 2) / 2;
}

function toHoursLabel(hours: number) {
  const normalizedHours = Math.max(0, roundToHalf(hours));
  const wholeHours = Math.floor(normalizedHours);
  const minutes = Math.round((normalizedHours - wholeHours) * 60);

  return `${wholeHours}h${minutes === 0 ? '00' : `${minutes}`.padStart(2, '0')}`;
}

function getRotativeScore(project: Project, projectLoad?: ProjectTaskLoad) {
  if (!projectLoad) {
    return Math.max(1, project.allocationPct / 10);
  }

  return Math.max(1, project.allocationPct / 10 + projectLoad.effortHours + projectLoad.openTasks * 1.5);
}

export function formatPlanningMoment(date: Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatHours(hours: number) {
  return toHoursLabel(hours);
}

export function getDefaultCycleValues(projects: Project[]): TodayCycleValues {
  const activeProjects = projects.filter((project) => project.status === 'active');

  return {
    availableHours: 10,
    projectsInCycle: Math.min(activeProjects.length, 3),
  };
}

export function createActualHoursMap(allocations: SuggestedAllocation[]) {
  return Object.fromEntries(allocations.map((allocation) => [allocation.projectId, allocation.plannedHours]));
}

export function mergeActualHoursWithAllocations(
  actualHours: Record<string, number>,
  allocations: SuggestedAllocation[],
) {
  return Object.fromEntries(
    allocations.map((allocation) => [allocation.projectId, actualHours[allocation.projectId] ?? allocation.plannedHours]),
  );
}

export function getActualHoursTotal(actualHours: Record<string, number>) {
  return Object.values(actualHours).reduce((total, value) => total + value, 0);
}

export function buildSuggestedAllocations(
  projects: Project[],
  projectLoadSummary: ProjectTaskLoad[],
  cycleValues: TodayCycleValues,
) {
  const activeProjects = projects.filter((project) => project.status === 'active');
  const loadMap = new Map(projectLoadSummary.map((item) => [item.projectId, item]));
  const fixedProjects = activeProjects.filter((project) => project.type === 'fixed');
  const rotativeProjects = activeProjects
    .filter((project) => project.type === 'rotative')
    .sort((left, right) => getRotativeScore(right, loadMap.get(right.id)) - getRotativeScore(left, loadMap.get(left.id)));

  const fixedAllocations: SuggestedAllocation[] = fixedProjects.map((project) => {
    const projectLoad = loadMap.get(project.id);

    return {
      projectId: project.id,
      projectName: project.name,
      colorHex: project.colorHex,
      kind: 'fixed',
      currentAllocationPct: project.allocationPct,
      suggestedAllocationPct: Math.round((project.fixedHoursPerDay / cycleValues.availableHours) * 100),
      plannedHours: roundToHalf(project.fixedHoursPerDay),
      openTasks: projectLoad?.openTasks ?? 0,
      effortHours: projectLoad?.effortHours ?? 0,
      reason: `Fixo · ${project.fixedDays.join(' · ')} · minimo de ${toHoursLabel(project.fixedHoursPerDay)}`,
    };
  });

  const rotativeSlots = Math.max(cycleValues.projectsInCycle - fixedAllocations.length, 0);
  const selectedRotatives = rotativeProjects.slice(0, rotativeSlots || rotativeProjects.length);
  const fixedHoursTotal = fixedAllocations.reduce((total, allocation) => total + allocation.plannedHours, 0);
  let remainingHours = Math.max(cycleValues.availableHours - fixedHoursTotal, 0);

  const rotativeAllocations = selectedRotatives.map((project, index) => {
    const projectLoad = loadMap.get(project.id);
    const selectedScores = selectedRotatives.map((candidate) => getRotativeScore(candidate, loadMap.get(candidate.id)));
    const scoreSum = selectedScores.reduce((total, score) => total + score, 0);
    const score = selectedScores[index] ?? 1;

    const rawHours = index === selectedRotatives.length - 1
      ? remainingHours
      : (remainingHours * score) / Math.max(scoreSum, 1);
    const plannedHours = index === selectedRotatives.length - 1 ? roundToHalf(remainingHours) : roundToHalf(rawHours);

    remainingHours = Math.max(0, remainingHours - plannedHours);

    return {
      projectId: project.id,
      projectName: project.name,
      colorHex: project.colorHex,
      kind: 'rotative' as const,
      currentAllocationPct: project.allocationPct,
      suggestedAllocationPct: Math.round((plannedHours / cycleValues.availableHours) * 100),
      plannedHours,
      openTasks: projectLoad?.openTasks ?? 0,
      effortHours: projectLoad?.effortHours ?? 0,
      reason: projectLoad
        ? `Rotativo · ${projectLoad.openTasks} task(s) abertas · ${toHoursLabel(projectLoad.effortHours)} em aberto`
        : 'Rotativo · entra pelo percentual semanal da carteira',
    };
  });

  return [...fixedAllocations, ...rotativeAllocations].filter((allocation) => allocation.plannedHours > 0);
}