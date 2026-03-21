'use client';

import { create } from 'zustand';

import { mockProjects } from '@/modules/projects/mocks/projects';
import type { Project, ProjectFormValues } from '@/modules/projects/types';
import { mockTasks } from '@/modules/tasks/mocks/tasks';
import type { Task, TaskFormValues } from '@/modules/tasks/types';
import type { TodayCycleValues } from '@/modules/today/types';
import { buildSuggestedAllocations, createActualHoursMap, getDefaultCycleValues } from '@/modules/today/utils/planner';
import { getProjectLoadSummary } from '@/modules/tasks/utils/tasks';

function cloneProject(project: Project): Project {
  return {
    ...project,
    fixedDays: [...project.fixedDays],
  };
}

function cloneTask(task: Task): Task {
  return { ...task };
}

function createProjectId(name: string, currentProjects: Project[]) {
  return `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${currentProjects.length + 1}`;
}

function createTaskId(title: string, currentTasks: Task[]) {
  return `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${currentTasks.length + 1}`;
}

function createInitialWorkspaceState() {
  const projects = mockProjects.map(cloneProject);
  const tasks = mockTasks.map(cloneTask);
  const todayCycleValues = getDefaultCycleValues(projects);
  const activeProjects = projects.filter((project) => project.status === 'active');
  const projectLoadSummary = getProjectLoadSummary(tasks, activeProjects);
  const allocations = buildSuggestedAllocations(activeProjects, projectLoadSummary, todayCycleValues);

  return {
    projects,
    tasks,
    todayCycleValues,
    todayActualHours: createActualHoursMap(allocations),
  };
}

interface WorkspaceStoreState {
  projects: Project[];
  tasks: Task[];
  todayCycleValues: TodayCycleValues;
  todayActualHours: Record<string, number>;
  addProject: (values: ProjectFormValues) => void;
  updateProject: (projectId: string, values: ProjectFormValues) => void;
  toggleProjectStatus: (projectId: string) => void;
  addTask: (values: TaskFormValues) => void;
  updateTask: (taskId: string, values: TaskFormValues) => void;
  toggleTaskDone: (taskId: string) => void;
  setTaskCycleAssignment: (taskId: string, cycleAssignment: Task['cycleAssignment']) => void;
  completeTask: (taskId: string) => void;
  skipTaskToNextCycle: (taskId: string) => void;
  setTodayCycleValues: (values: TodayCycleValues) => void;
  setTodayActualHours: (actualHours: Record<string, number>) => void;
  resetWorkspaceStore: () => void;
}

export const useWorkspaceStore = create<WorkspaceStoreState>((set) => ({
  ...createInitialWorkspaceState(),
  addProject: (values) => set((state) => ({
    projects: [
      {
        id: createProjectId(values.name, state.projects),
        ...values,
      },
      ...state.projects,
    ],
  })),
  updateProject: (projectId, values) => set((state) => ({
    projects: state.projects.map((project) => (project.id === projectId ? { ...project, ...values } : project)),
  })),
  toggleProjectStatus: (projectId) => set((state) => ({
    projects: state.projects.map((project) => (
      project.id === projectId
        ? { ...project, status: project.status === 'active' ? 'paused' : 'active' }
        : project
    )),
  })),
  addTask: (values) => set((state) => ({
    tasks: [
      {
        id: createTaskId(values.title, state.tasks),
        ...values,
      },
      ...state.tasks,
    ],
  })),
  updateTask: (taskId, values) => set((state) => ({
    tasks: state.tasks.map((task) => (task.id === taskId ? { ...task, ...values } : task)),
  })),
  toggleTaskDone: (taskId) => set((state) => ({
    tasks: state.tasks.map((task) => (
      task.id === taskId
        ? { ...task, status: task.status === 'done' ? 'todo' : 'done' }
        : task
    )),
  })),
  setTaskCycleAssignment: (taskId, cycleAssignment) => set((state) => ({
    tasks: state.tasks.map((task) => (task.id === taskId ? { ...task, cycleAssignment } : task)),
  })),
  completeTask: (taskId) => set((state) => ({
    tasks: state.tasks.map((task) => (
      task.id === taskId
        ? { ...task, status: 'done', cycleAssignment: 'backlog' }
        : task
    )),
  })),
  skipTaskToNextCycle: (taskId) => set((state) => ({
    tasks: state.tasks.map((task) => (
      task.id === taskId
        ? { ...task, cycleAssignment: 'next', status: task.status === 'done' ? 'todo' : task.status }
        : task
    )),
  })),
  setTodayCycleValues: (values) => set({ todayCycleValues: values }),
  setTodayActualHours: (actualHours) => set({ todayActualHours: actualHours }),
  resetWorkspaceStore: () => set(createInitialWorkspaceState()),
}));

export function resetWorkspaceStore() {
  useWorkspaceStore.getState().resetWorkspaceStore();
}