'use client';

import { create } from 'zustand';

import { mockProjects } from '@/modules/projects/mocks/projects';
import type { Project, ProjectFormValues } from '@/modules/projects/types';
import { defaultTaskColumns } from '@/modules/tasks/mocks/taskColumns';
import { mockTasks } from '@/modules/tasks/mocks/tasks';
import type { Task, TaskColumn, TaskColumnFormValues, TaskFormValues } from '@/modules/tasks/types';
import type { CycleSnapshot, CycleState, PulseRecord, SessionState, TimeBlock, TodayCycleValues } from '@/modules/today/types';
import { buildSuggestedAllocations, createActualHoursMap, getDefaultCycleValues } from '@/modules/today/utils/planner';
import { computeCycleSnapshot } from '@/modules/today/utils/session';
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

function cloneTaskColumn(column: TaskColumn): TaskColumn {
  return { ...column };
}

function createProjectId(name: string, currentProjects: Project[]) {
  return `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${currentProjects.length + 1}`;
}

function createTaskId(title: string, currentTasks: Task[]) {
  return `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${currentTasks.length + 1}`;
}

function createTaskColumnId(title: string, currentColumns: TaskColumn[]) {
  return `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${currentColumns.length + 1}`;
}

function createChecklistItemId(label: string, index: number) {
  return `${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${index + 1}`;
}

function getColumnIdForStatus(columns: TaskColumn[], status: Task['status']) {
  return columns.find((column) => column.status === status)?.id ?? columns[0]?.id ?? 'backlog';
}

function getTodayISODate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function createInitialWorkspaceState() {
  const projects = mockProjects.map(cloneProject);
  const taskColumns = defaultTaskColumns.map(cloneTaskColumn);
  const tasks = mockTasks.map(cloneTask);
  const todayCycleValues = getDefaultCycleValues(projects);
  const activeProjects = projects.filter((project) => project.status === 'active');
  const projectLoadSummary = getProjectLoadSummary(tasks, activeProjects);
  const allocations = buildSuggestedAllocations(activeProjects, projectLoadSummary, todayCycleValues);

  return {
    projects,
    taskColumns,
    tasks,
    todayCycleValues,
    todayActualHours: createActualHoursMap(allocations),
    sessionState: 'idle' as SessionState,
    sessionStartedAt: null as string | null,
    activeProjectId: null as string | null,
    timeBlocks: [] as TimeBlock[],
    pulseHistory: [] as PulseRecord[],
    cycleDate: getTodayISODate(),
    cycleState: 'PLANNED' as CycleState,
    cycleSnapshot: null as CycleSnapshot | null,
  };
}

interface WorkspaceStoreState {
  projects: Project[];
  taskColumns: TaskColumn[];
  tasks: Task[];
  todayCycleValues: TodayCycleValues;
  todayActualHours: Record<string, number>;
  sessionState: SessionState;
  sessionStartedAt: string | null;
  activeProjectId: string | null;
  timeBlocks: TimeBlock[];
  pulseHistory: PulseRecord[];
  cycleDate: string;
  cycleState: CycleState;
  cycleSnapshot: CycleSnapshot | null;
  startSession: (projectId: string) => void;
  pauseSession: (reason: 'manual' | 'inactivity') => void;
  resumeSession: () => void;
  switchActiveProject: (projectId: string) => void;
  closeDay: () => void;
  setCycleState: (state: CycleState) => void;
  recordPulse: (status: 'confirmed' | 'unconfirmed') => void;
  addProject: (values: ProjectFormValues) => void;
  updateProject: (projectId: string, values: ProjectFormValues) => void;
  toggleProjectStatus: (projectId: string) => void;
  addTask: (values: TaskFormValues) => void;
  updateTask: (taskId: string, values: TaskFormValues) => void;
  addTaskColumn: (values: TaskColumnFormValues) => void;
  removeTaskColumn: (columnId: string) => void;
  moveTaskToColumn: (taskId: string, columnId: string) => void;
  archiveTask: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
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
  startSession: (projectId) => set((state) => {
    if (state.sessionState !== 'idle') return state;
    const now = new Date().toISOString();
    return {
      sessionState: 'running',
      activeProjectId: projectId,
      sessionStartedAt: now,
      cycleState: 'ACTIVE',
      timeBlocks: [...state.timeBlocks, { projectId, startedAt: now, endedAt: null, confirmedMinutes: 0 }],
    };
  }),
  pauseSession: (reason) => set((state) => {
    if (state.sessionState !== 'running') return state;
    const now = new Date().toISOString();
    return {
      sessionState: reason === 'manual' ? 'paused_manual' : 'paused_inactivity',
      timeBlocks: state.timeBlocks.map((block) =>
        block.endedAt === null ? { ...block, endedAt: now } : block,
      ),
    };
  }),
  resumeSession: () => set((state) => {
    if (state.sessionState !== 'paused_manual' && state.sessionState !== 'paused_inactivity') return state;
    if (!state.activeProjectId) return state;
    const now = new Date().toISOString();
    return {
      sessionState: 'running',
      timeBlocks: [...state.timeBlocks, { projectId: state.activeProjectId, startedAt: now, endedAt: null, confirmedMinutes: 0 }],
    };
  }),
  switchActiveProject: (projectId) => set((state) => {
    if (state.sessionState !== 'running') {
      return { activeProjectId: projectId };
    }
    if (projectId === state.activeProjectId) {
      return state;
    }
    const now = new Date().toISOString();
    const timeBlocks = state.timeBlocks.map((block) =>
      block.endedAt === null ? { ...block, endedAt: now } : block,
    );
    return {
      activeProjectId: projectId,
      timeBlocks: [...timeBlocks, { projectId, startedAt: now, endedAt: null, confirmedMinutes: 0 }],
    };
  }),
  closeDay: () => set((state) => {
    if (state.sessionState !== 'running' && state.sessionState !== 'paused_manual' && state.sessionState !== 'paused_inactivity') return state;
    const now = new Date().toISOString();
    const updatedTimeBlocks = state.timeBlocks.map((block) =>
      block.endedAt === null ? { ...block, endedAt: now } : block,
    );
    const cycleSnapshot = computeCycleSnapshot({
      tasks: state.tasks,
      timeBlocks: updatedTimeBlocks,
      todayCycleValues: state.todayCycleValues,
    });
    return {
      sessionState: 'completed',
      cycleState: 'CLOSED',
      cycleSnapshot,
      timeBlocks: updatedTimeBlocks,
    };
  }),
  setCycleState: (cycleState) => set({ cycleState }),
  recordPulse: (status) => set((state) => {
    const now = new Date().toISOString();
    return {
      pulseHistory: [...state.pulseHistory, { firedAt: now, respondedAt: status === 'confirmed' ? now : null, status }],
    };
  }),
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
        isArchived: false,
        ...values,
        checklist: values.checklist.map((item, index) => ({
          ...item,
          id: item.id || createChecklistItemId(item.label, index),
        })),
      },
      ...state.tasks,
    ],
  })),
  updateTask: (taskId, values) => set((state) => ({
    tasks: state.tasks.map((task) => (
      task.id === taskId
        ? {
          ...task,
          ...values,
          checklist: values.checklist.map((item, index) => ({
            ...item,
            id: item.id || createChecklistItemId(item.label, index),
          })),
        }
        : task
    )),
  })),
  addTaskColumn: (values) => set((state) => ({
    taskColumns: [
      ...state.taskColumns,
      {
        id: createTaskColumnId(values.title, state.taskColumns),
        ...values,
      },
    ],
  })),
  removeTaskColumn: (columnId) => set((state) => {
    const remainingColumns = state.taskColumns.filter((column) => column.id !== columnId);

    if (remainingColumns.length === 0) {
      return state;
    }

    const fallbackColumn = remainingColumns.find((column) => column.status === 'todo') ?? remainingColumns[0];

    return {
      taskColumns: remainingColumns,
      tasks: state.tasks.map((task) => (
        task.columnId === columnId
          ? { ...task, columnId: fallbackColumn.id, status: fallbackColumn.status }
          : task
      )),
    };
  }),
  moveTaskToColumn: (taskId, columnId) => set((state) => {
    const targetColumn = state.taskColumns.find((column) => column.id === columnId);

    if (!targetColumn) {
      return { tasks: state.tasks };
    }

    return {
      tasks: state.tasks.map((task) => (
        task.id === taskId
          ? { ...task, columnId: targetColumn.id, status: targetColumn.status }
          : task
      )),
    };
  }),
  archiveTask: (taskId) => set((state) => ({
    tasks: state.tasks.map((task) => (
      task.id === taskId
        ? { ...task, isArchived: true, cycleAssignment: 'backlog' }
        : task
    )),
  })),
  deleteTask: (taskId) => set((state) => ({
    tasks: state.tasks.filter((task) => task.id !== taskId),
  })),
  toggleTaskDone: (taskId) => set((state) => ({
    tasks: state.tasks.map((task) => (
      task.id === taskId
        ? {
          ...task,
          status: task.status === 'done' ? 'todo' : 'done',
          columnId: getColumnIdForStatus(state.taskColumns, task.status === 'done' ? 'todo' : 'done'),
          isArchived: false,
        }
        : task
    )),
  })),
  setTaskCycleAssignment: (taskId, cycleAssignment) => set((state) => ({
    tasks: state.tasks.map((task) => (task.id === taskId ? { ...task, cycleAssignment } : task)),
  })),
  completeTask: (taskId) => set((state) => ({
    tasks: state.tasks.map((task) => (
      task.id === taskId
        ? { ...task, status: 'done', columnId: getColumnIdForStatus(state.taskColumns, 'done'), cycleAssignment: 'backlog', isArchived: false }
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