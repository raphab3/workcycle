import type { Project } from '@/modules/projects/types';
import type { ProjectTaskLoad, Task, TaskDeadlineState, TaskFiltersValues } from '@/modules/tasks/types';

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

    return matchesProject && matchesPriority && matchesStatus;
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