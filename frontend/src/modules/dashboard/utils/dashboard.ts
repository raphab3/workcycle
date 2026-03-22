import type { Project } from '@/modules/projects/types';
import { getProjectLoadSummary, getTaskDeadlineLabel, getTaskDeadlineState, getOpenTasks } from '@/modules/tasks/utils/tasks';
import type { Task } from '@/modules/tasks/types';
import { buildSuggestedAllocations } from '@/modules/today/utils/planner';
import type { TodayCycleValues } from '@/modules/today/types';
import { buildTodayOperationalContext } from '@/modules/today/utils/context';
import { buildWeeklyScenario } from '@/modules/weekly/utils/weekly';

import type { DashboardProjectLoadRow, DashboardRiskSignalItem, DashboardScenarioSummary, DashboardTimelinePoint, DashboardTimeSpentRow } from '../types';

interface BuildDashboardScenarioParams {
  projects: Project[];
  tasks: Task[];
  cycleValues: TodayCycleValues;
  cycleDate: string;
  actualHours: Record<string, number>;
}

function roundToSingleDecimal(value: number) {
  return Number(value.toFixed(1));
}

function formatShortDateLabel(date: Date) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(date);
}

function buildDashboardTimeline(cycleDate: string, timeSpentRows: DashboardTimeSpentRow[]): DashboardTimelinePoint[] {
  const [year, month, day] = cycleDate.split('-').map(Number);
  const endDate = new Date(year, (month ?? 1) - 1, day ?? 1);
  const activityPattern = [0.62, 0.75, 0.84, 0.92, 1, 0.88, 0.7];

  return Array.from({ length: 30 }, (_, index) => {
    const currentDate = new Date(endDate);
    currentDate.setDate(endDate.getDate() - (29 - index));
    const dayOfWeek = currentDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const intensity = isWeekend ? 0.18 : activityPattern[index % activityPattern.length] ?? 0.8;
    const projectValues = timeSpentRows.map((row, projectIndex) => {
      const baseline = row.weekHours / 5;
      const variance = 0.84 + (((index + projectIndex) % 5) * 0.06);
      const hours = roundToSingleDecimal(baseline * intensity * variance);

      return {
        projectId: row.projectId,
        projectName: row.projectName,
        colorHex: row.colorHex,
        hours,
      };
    });
    const totalHours = roundToSingleDecimal(projectValues.reduce((sum, item) => sum + item.hours, 0));

    return {
      date: currentDate.toISOString(),
      shortLabel: formatShortDateLabel(currentDate),
      totalHours,
      projects: projectValues,
    };
  });
}

function buildDashboardRiskSignals(projects: Project[], tasks: Task[]): DashboardRiskSignalItem[] {
  const openTasks = getOpenTasks(tasks);
  const overdueTasks = openTasks.filter((task) => getTaskDeadlineState(task) === 'overdue');
  const dueSoonTasks = openTasks.filter((task) => getTaskDeadlineState(task) === 'today' || getTaskDeadlineState(task) === 'soon');
  const blockedTasks = openTasks.filter((task) => task.status === 'blocked');
  const sprintPressureProjects = projects
    .filter((project) => project.status === 'active' && project.sprintDays <= 14)
    .map((project) => ({
      project,
      relatedTasks: openTasks.filter((task) => task.projectId === project.id),
    }))
    .filter(({ relatedTasks }) => relatedTasks.length > 0)
    .sort((left, right) => right.relatedTasks.length - left.relatedTasks.length);

  return [
    {
      id: 'overdue',
      eyebrow: 'Atrasos',
      title: overdueTasks.length > 0 ? `${overdueTasks.length} task(s) ja estouraram o prazo` : 'Nenhuma task atrasada agora',
      description: overdueTasks.length > 0
        ? 'Priorize o que ja venceu para evitar arrastar pressao improdutiva para o restante da semana.'
        : 'A carteira segue sem atraso vencido no estado atual do workspace.',
      tone: overdueTasks.length > 0 ? 'danger' : 'positive',
      count: overdueTasks.length,
      details: overdueTasks.map((task) => `${task.title} · ${getTaskDeadlineLabel(task)}`),
    },
    {
      id: 'due-soon',
      eyebrow: 'Prazo curto',
      title: dueSoonTasks.length > 0 ? `${dueSoonTasks.length} task(s) pedem decisao ainda nesta janela` : 'Sem vencimentos imediatos no radar',
      description: dueSoonTasks.length > 0
        ? 'Itens que vencem hoje ou nos proximos dois dias merecem reserva explicita de capacidade.'
        : 'Nao ha pressao relevante de vencimento para as proximas 48 horas.',
      tone: dueSoonTasks.length > 0 ? 'warning' : 'positive',
      count: dueSoonTasks.length,
      details: dueSoonTasks.map((task) => `${task.title} · ${getTaskDeadlineLabel(task)}`),
    },
    {
      id: 'blocked',
      eyebrow: 'Bloqueios',
      title: blockedTasks.length > 0 ? `${blockedTasks.length} bloqueio(s) travando fluxo` : 'Nenhum bloqueio ativo relevante',
      description: blockedTasks.length > 0
        ? 'Bloqueios drenam previsibilidade. Vale decidir owner, dependencia ou descarte o quanto antes.'
        : 'O fluxo aberto nao mostra frentes bloqueadas neste momento.',
      tone: blockedTasks.length > 0 ? 'danger' : 'positive',
      count: blockedTasks.length,
      details: blockedTasks.map((task) => `${task.title} · ${task.estimatedHours.toFixed(1).replace('.', ',')}h comprometidas`),
    },
    {
      id: 'sprint',
      eyebrow: 'Sprint',
      title: sprintPressureProjects.length > 0 ? `${sprintPressureProjects.length} projeto(s) com janela curta e carga aberta` : 'Nenhuma sprint curta pressionando o ciclo',
      description: sprintPressureProjects.length > 0
        ? 'Projetos com sprint de ate 14 dias e fila aberta precisam de leitura recorrente para evitar empilhar atraso.'
        : 'Nao ha combinacao de sprint curta com fila aberta exigindo ajuste especial.',
      tone: sprintPressureProjects.length > 0 ? 'warning' : 'neutral',
      count: sprintPressureProjects.length,
      details: sprintPressureProjects.map(({ project, relatedTasks }) => `${project.name} · ${project.sprintDays} dias · ${relatedTasks.length} task(s) abertas`),
    },
  ];
}

export function buildDashboardScenario({ projects, tasks, cycleValues, cycleDate, actualHours }: BuildDashboardScenarioParams): DashboardScenarioSummary {
  const activeProjects = projects.filter((project) => project.status === 'active');
  const projectLoadSummary = getProjectLoadSummary(tasks, activeProjects);
  const allocations = buildSuggestedAllocations(activeProjects, projectLoadSummary, cycleValues);
  const context = buildTodayOperationalContext({
    projects,
    tasks,
    allocations,
    actualHours,
    projectLoadSummary,
  });
  const weekly = buildWeeklyScenario({
    projects,
    tasks,
    cycleValues,
    actualHours,
  });
  const openTasks = getOpenTasks(tasks);
  const loadRows: DashboardProjectLoadRow[] = projectLoadSummary
    .map((row) => {
      const projectTasks = openTasks.filter((task) => task.projectId === row.projectId);
      const overdueTasks = projectTasks.filter((task) => getTaskDeadlineState(task) === 'overdue').length;
      const dueSoonTasks = projectTasks.filter((task) => {
        const deadlineState = getTaskDeadlineState(task);

        return deadlineState === 'today' || deadlineState === 'soon';
      }).length;
      const blockedTasks = projectTasks.filter((task) => task.status === 'blocked').length;

      return {
        ...row,
        overdueTasks,
        dueSoonTasks,
        blockedTasks,
        pressureScore: row.effortHours * 10 + overdueTasks * 6 + dueSoonTasks * 3 + blockedTasks * 5,
      };
    })
    .sort((left, right) => right.pressureScore - left.pressureScore);

  const weeklyRowsById = new Map(weekly.rows.map((row) => [row.projectId, row]));
  const timeSpentRows: DashboardTimeSpentRow[] = activeProjects
    .map((project) => {
      const weeklyRow = weeklyRowsById.get(project.id);
      const weekHours = roundToSingleDecimal(weeklyRow?.actualWeekHours ?? (actualHours[project.id] ?? 0));
      const monthHours = roundToSingleDecimal(weekHours * 4);

      return {
        projectId: project.id,
        projectName: project.name,
        colorHex: project.colorHex,
        weekHours,
        monthHours,
      };
    })
    .sort((left, right) => right.weekHours - left.weekHours);
  const timeline = buildDashboardTimeline(cycleDate, timeSpentRows);

  return {
    context,
    weekly,
    loadRows,
    riskSignals: buildDashboardRiskSignals(projects, tasks),
    timeSpentRows,
    timeline,
    highlightedWeeklyRows: weekly.rows.slice(0, 4),
    topRisks: openTasks
      .filter((task) => getTaskDeadlineState(task) === 'overdue' || task.status === 'blocked')
      .sort((left, right) => left.dueInDays - right.dueInDays)
      .slice(0, 4),
  };
}