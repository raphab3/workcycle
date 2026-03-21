import type { Project } from '@/modules/projects/types';
import type { ProjectTaskLoad, Task, TaskCycleAssignment, TaskCyclePlan, TaskCyclePlanItem, TaskDeadlineState, TaskFiltersValues } from '@/modules/tasks/types';

const priorityRank = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
} as const;

const statusRank = {
  doing: 0,
  todo: 1,
  blocked: 2,
  done: 3,
} as const;

export function getTaskDeadlineState(task: Pick<Task, 'dueInDays'>): TaskDeadlineState {
  if (task.dueInDays < 0) {
    return 'overdue';
  }

  if (task.dueInDays === 0) {
    return 'today';
  }

  if (task.dueInDays <= 2) {
    return 'soon';
  }

  return 'planned';
}

export function getTaskDeadlineLabel(task: Pick<Task, 'dueInDays'>) {
  const state = getTaskDeadlineState(task);

  if (state === 'overdue') {
    return `${Math.abs(task.dueInDays)}d em atraso`;
  }

  if (state === 'today') {
    return 'vence hoje';
  }

  if (state === 'soon') {
    return `vence em ${task.dueInDays} dias`;
  }

  return `vence em ${task.dueInDays} dias`;
}

export function filterTasks(tasks: Task[], filters: TaskFiltersValues) {
  return tasks.filter((task) => {
    const matchesProject = filters.projectId === 'all' || task.projectId === filters.projectId;
    const matchesPriority = filters.priority === 'all' || task.priority === filters.priority;
    const matchesStatus = filters.status === 'all' || task.status === filters.status;
    const matchesCycle = filters.cycleAssignment === 'all' || task.cycleAssignment === filters.cycleAssignment;

    return matchesProject && matchesPriority && matchesStatus && matchesCycle;
  });
}

export function getOpenTasks(tasks: Task[]) {
  return tasks.filter((task) => task.status !== 'done');
}

export function getOpenTasksCount(tasks: Task[]) {
  return getOpenTasks(tasks).length;
}

export function getUrgentTasksCount(tasks: Task[]) {
  return getOpenTasks(tasks).filter((task) => getTaskDeadlineState(task) === 'overdue' || getTaskDeadlineState(task) === 'today').length;
}

export function getOpenEffortHours(tasks: Task[]) {
  return getOpenTasks(tasks).reduce((total, task) => total + task.estimatedHours, 0);
}

export function getProjectLoadSummary(tasks: Task[], projects: Project[]): ProjectTaskLoad[] {
  const openTasks = getOpenTasks(tasks);

  return projects
    .map((project) => {
      const projectTasks = openTasks.filter((task) => task.projectId === project.id);

      return {
        projectId: project.id,
        projectName: project.name,
        colorHex: project.colorHex,
        openTasks: projectTasks.length,
        effortHours: projectTasks.reduce((total, task) => total + task.estimatedHours, 0),
      };
    })
    .filter((projectLoad) => projectLoad.openTasks > 0)
    .sort((left, right) => right.effortHours - left.effortHours);
}

export function getCycleTaskHours(tasks: Task[], cycleAssignment: TaskCycleAssignment) {
  return getOpenTasks(tasks)
    .filter((task) => task.cycleAssignment === cycleAssignment)
    .reduce((total, task) => total + task.estimatedHours, 0);
}

export function getCycleTaskCount(tasks: Task[], cycleAssignment: TaskCycleAssignment) {
  return getOpenTasks(tasks).filter((task) => task.cycleAssignment === cycleAssignment).length;
}

export function buildCycleTaskPlan(tasks: Task[], projects: Project[], availableHours: number): TaskCyclePlan {
  const projectMap = new Map(projects.map((project) => [project.id, project]));
  let accumulatedHours = 0;

  const cycleTasks: TaskCyclePlanItem[] = getOpenTasks(tasks)
    .filter((task) => task.cycleAssignment === 'current')
    .sort((left, right) => {
      if (statusRank[left.status] !== statusRank[right.status]) {
        return statusRank[left.status] - statusRank[right.status];
      }

      if (left.dueInDays !== right.dueInDays) {
        return left.dueInDays - right.dueInDays;
      }

      if (priorityRank[left.priority] !== priorityRank[right.priority]) {
        return priorityRank[left.priority] - priorityRank[right.priority];
      }

      return right.estimatedHours - left.estimatedHours;
    })
    .map((task) => {
      accumulatedHours += task.estimatedHours;
      const project = projectMap.get(task.projectId);

      return {
        taskId: task.id,
        title: task.title,
        projectId: task.projectId,
        projectName: project?.name ?? 'Projeto nao encontrado',
        colorHex: project?.colorHex ?? '#94A3B8',
        priority: task.priority,
        status: task.status,
        estimatedHours: task.estimatedHours,
        dueLabel: getTaskDeadlineLabel(task),
        fitsInCycle: accumulatedHours <= availableHours,
        cumulativeHours: accumulatedHours,
      };
    });

  const plannedHours = cycleTasks.reduce((total, task) => total + task.estimatedHours, 0);
  const fittedHours = cycleTasks.filter((task) => task.fitsInCycle).reduce((total, task) => total + task.estimatedHours, 0);

  return {
    tasks: cycleTasks,
    plannedHours,
    remainingHours: Math.max(0, Number((availableHours - fittedHours).toFixed(1))),
    overflowHours: Math.max(0, Number((plannedHours - availableHours).toFixed(1))),
  };
}