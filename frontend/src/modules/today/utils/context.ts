import type { Project } from '@/modules/projects/types';
import type { ProjectTaskLoad, Task } from '@/modules/tasks/types';
import { getOpenEffortHours, getOpenTasks, getTaskDeadlineState } from '@/modules/tasks/utils/tasks';
import type { SuggestedAllocation } from '@/modules/today/types';

import { formatHours, getActualHoursTotal } from './planner';

export type TodayContextTone = 'neutral' | 'positive' | 'warning' | 'danger';

export interface TodayContextCard {
  id: 'week' | 'month' | 'risk';
  eyebrow: string;
  title: string;
  description: string;
  highlights: string[];
  tone: TodayContextTone;
}

export interface TodayOperationalContext {
  activeProjectsCount: number;
  portfolioAllocationPct: number;
  plannedTodayHours: number;
  actualTodayHours: number;
  todayDeltaHours: number;
  openEffortHours: number;
  overdueTasksCount: number;
  dueTodayTasksCount: number;
  blockedTasksCount: number;
  projectedWeekHours: number;
  projectedMonthHours: number;
  backlogDaysAtCurrentPace: number;
  monthBacklogSharePct: number;
  pressureProjectName: string | null;
  pressureProjectHours: number;
  contextSignals: string[];
  cards: TodayContextCard[];
}

interface BuildTodayOperationalContextParams {
  projects: Project[];
  tasks: Task[];
  allocations: SuggestedAllocation[];
  actualHours: Record<string, number>;
  projectLoadSummary: ProjectTaskLoad[];
}

function roundToSingleDecimal(value: number) {
  return Number(value.toFixed(1));
}

function formatSignedHours(hours: number) {
  const prefix = hours > 0 ? '+' : hours < 0 ? '-' : '';

  return `${prefix}${formatHours(Math.abs(hours))}`;
}

function getMonthTone(monthBacklogSharePct: number): TodayContextTone {
  if (monthBacklogSharePct >= 60) {
    return 'warning';
  }

  if (monthBacklogSharePct === 0) {
    return 'positive';
  }

  return 'neutral';
}

export function buildTodayOperationalContext({
  projects,
  tasks,
  allocations,
  actualHours,
  projectLoadSummary,
}: BuildTodayOperationalContextParams): TodayOperationalContext {
  const activeProjects = projects.filter((project) => project.status === 'active');
  const openTasks = getOpenTasks(tasks);
  const plannedTodayHours = allocations.reduce((total, allocation) => total + allocation.plannedHours, 0);
  const actualTodayHours = getActualHoursTotal(actualHours);
  const todayDeltaHours = roundToSingleDecimal(actualTodayHours - plannedTodayHours);
  const openEffortHours = getOpenEffortHours(tasks);
  const overdueTasksCount = openTasks.filter((task) => getTaskDeadlineState(task) === 'overdue').length;
  const dueTodayTasksCount = openTasks.filter((task) => getTaskDeadlineState(task) === 'today').length;
  const blockedTasksCount = openTasks.filter((task) => task.status === 'blocked').length;
  const portfolioAllocationPct = activeProjects.reduce((total, project) => total + project.allocationPct, 0);
  const projectedWeekHours = roundToSingleDecimal(actualTodayHours * 5);
  const projectedMonthHours = roundToSingleDecimal(actualTodayHours * 20);
  const backlogDaysAtCurrentPace = actualTodayHours > 0 ? roundToSingleDecimal(openEffortHours / actualTodayHours) : 0;
  const monthBacklogSharePct = projectedMonthHours > 0
    ? Math.round((openEffortHours / projectedMonthHours) * 100)
    : 0;
  const pressureProject = projectLoadSummary[0];
  const pausedProjectWithPendingWork = projects.find(
    (project) => project.status === 'paused' && openTasks.some((task) => task.projectId === project.id),
  );
  const riskTone: TodayContextTone = overdueTasksCount > 0 || blockedTasksCount > 0
    ? 'danger'
    : dueTodayTasksCount > 0
      ? 'warning'
      : 'positive';
  const weekTone: TodayContextTone = todayDeltaHours > 0.5
    ? 'warning'
    : todayDeltaHours < -0.5
      ? 'positive'
      : 'neutral';

  const cards: TodayContextCard[] = [
    {
      id: 'week',
      eyebrow: 'Semana',
      title: `${formatHours(projectedWeekHours)} projetadas no ritmo atual`,
      description: `Se a escala registrada hoje se repetir por 5 dias uteis, a semana fecha com ${formatHours(projectedWeekHours)} de dedicacao total.`,
      highlights: [
        `Hoje ${formatHours(actualTodayHours)} reais para ${formatHours(plannedTodayHours)} previstas`,
        `Saldo do dia ${formatSignedHours(todayDeltaHours)}`,
      ],
      tone: weekTone,
    },
    {
      id: 'month',
      eyebrow: 'Mes',
      title: `Backlog ocupa ${monthBacklogSharePct}% da janela de 4 semanas`,
      description: `A carga aberta soma ${formatHours(openEffortHours)} e consumiria ${backlogDaysAtCurrentPace.toFixed(1)} dia(s) uteis mantendo a cadencia observada hoje.`,
      highlights: [
        `${formatHours(projectedMonthHours)} projetadas em 4 semanas`,
        pressureProject
          ? `${pressureProject.projectName} lidera com ${formatHours(pressureProject.effortHours)} em aberto`
          : 'Sem projeto pressionando a fila agora',
      ],
      tone: getMonthTone(monthBacklogSharePct),
    },
    {
      id: 'risk',
      eyebrow: 'Risco',
      title: overdueTasksCount + dueTodayTasksCount + blockedTasksCount > 0
        ? `${overdueTasksCount + dueTodayTasksCount + blockedTasksCount} sinais de atencao ativos`
        : 'Sem risco imediato relevante',
      description: pausedProjectWithPendingWork
        ? `${pausedProjectWithPendingWork.name} esta pausado, mas ainda carrega pendencia aberta e precisa de decisao.`
        : 'A carteira ativa segue sem frentes pausadas com carga em aberto.',
      highlights: [
        `${overdueTasksCount} task(s) em atraso`,
        `${dueTodayTasksCount} vencem hoje`,
        `${blockedTasksCount} bloqueada(s)`,
      ],
      tone: riskTone,
    },
  ];

  const contextSignals = [
    `${activeProjects.length} projetos ativos no ciclo`,
    `${portfolioAllocationPct}% da carteira ativa comprometida`,
    pressureProject
      ? `Maior pressao atual em ${pressureProject.projectName}`
      : 'Sem carga aberta dominante',
    pausedProjectWithPendingWork
      ? `${pausedProjectWithPendingWork.name} pausado com pendencia aberta`
      : 'Nenhum projeto pausado com pendencia',
  ];

  return {
    activeProjectsCount: activeProjects.length,
    portfolioAllocationPct,
    plannedTodayHours,
    actualTodayHours,
    todayDeltaHours,
    openEffortHours,
    overdueTasksCount,
    dueTodayTasksCount,
    blockedTasksCount,
    projectedWeekHours,
    projectedMonthHours,
    backlogDaysAtCurrentPace,
    monthBacklogSharePct,
    pressureProjectName: pressureProject?.projectName ?? null,
    pressureProjectHours: pressureProject?.effortHours ?? 0,
    contextSignals,
    cards,
  };
}