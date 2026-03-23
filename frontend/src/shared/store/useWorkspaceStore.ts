'use client';

import { create } from 'zustand';

import { mockProjects } from '@/modules/projects/mocks/projects';
import type { UpdateUserSettingsInput } from '@/modules/auth/types';
import type { Project, ProjectFormValues } from '@/modules/projects/types';
import { defaultTaskColumns } from '@/modules/tasks/mocks/taskColumns';
import { mockTasks } from '@/modules/tasks/mocks/tasks';
import type { Task, TaskColumn, TaskColumnFormValues, TaskFormValues } from '@/modules/tasks/types';
import type {
  ActivePulse,
  CloseDayReview,
  CycleSnapshot,
  CycleState,
  PreviousCycleSummary,
  PulseRecord,
  PulseResolution,
  RegularizationState,
  RolloverNotice,
  SessionState,
  TimeBlock,
  TodayCycleValues,
} from '@/modules/today/types';
import { getCycleBoundaryTimestamp, getLocalISODate } from '@/modules/today/utils/boundary';
import {
  addMinutesToTimestamp,
  applyConfirmedMinutesToTimeBlocks,
  buildCloseDayReview,
  DEFAULT_PULSE_INTERVAL_MINUTES,
  DEFAULT_PULSE_RESPONSE_WINDOW_MINUTES,
} from '@/modules/today/utils/pulse';
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
  return {
    ...task,
    checklist: task.checklist.map((item) => ({ ...item })),
  };
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
  return getLocalISODate(new Date());
}

function getTomorrowISODate(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const day = String(tomorrow.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const defaultOperationalSettings = {
  cycleStartHour: '00:00',
  dailyReviewTime: '18:00',
  notificationsEnabled: false,
  timezone: 'UTC',
} satisfies Required<UpdateUserSettingsInput>;

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
    activePulse: null as ActivePulse | null,
    nextPulseDueAt: null as string | null,
    regularizationState: { isOpen: false, highlightedPulseIndex: null } as RegularizationState,
    closeDayReview: null as CloseDayReview | null,
    cycleDate: getTodayISODate(),
    cycleState: 'PLANNED' as CycleState,
    cycleSnapshot: null as CycleSnapshot | null,
    previousCycleSummary: null as PreviousCycleSummary | null,
    rolloverNotice: null as RolloverNotice | null,
    deferNextCycleUntilManualStart: false,
    operationalSettings: defaultOperationalSettings,
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
  activePulse: ActivePulse | null;
  nextPulseDueAt: string | null;
  regularizationState: RegularizationState;
  closeDayReview: CloseDayReview | null;
  cycleDate: string;
  cycleState: CycleState;
  cycleSnapshot: CycleSnapshot | null;
  previousCycleSummary: PreviousCycleSummary | null;
  rolloverNotice: RolloverNotice | null;
  deferNextCycleUntilManualStart: boolean;
  operationalSettings: Required<UpdateUserSettingsInput>;
  startSession: (projectId: string) => void;
  pauseSession: (reason: 'manual' | 'inactivity') => void;
  resumeSession: () => void;
  switchActiveProject: (projectId: string) => void;
  closeDay: () => void;
  autoCloseCycle: (boundaryAt?: string, options?: { deferNextCycleUntilManualStart?: boolean }) => void;
  startNextCycle: (options?: { continueSession?: boolean; keepActiveProject?: boolean; nextDate?: string; startedAt?: string }) => void;
  syncCycleBoundary: (currentAt?: string) => void;
  clearRolloverNotice: () => void;
  setCycleState: (state: CycleState) => void;
  recordPulse: (status: 'confirmed' | 'unconfirmed') => void;
  firePulse: (firedAt?: string) => void;
  confirmActivePulse: (respondedAt?: string) => void;
  expireActivePulse: (expiredAt?: string) => void;
  openRegularizationPanel: (pulseIndex?: number) => void;
  closeRegularizationPanel: () => void;
  reviewPulse: (pulseIndex: number, resolution: Exclude<PulseResolution, 'pending'>, reviewedAt?: string) => void;
  updateTimeBlock: (timeBlockIndex: number, updates: Partial<TimeBlock>) => void;
  prepareCloseDayReview: () => CloseDayReview;
  replaceProjects: (projects: Project[]) => void;
  replaceTasks: (tasks: Task[]) => void;
  addProject: (values: ProjectFormValues) => void;
  updateProject: (projectId: string, values: ProjectFormValues) => void;
  toggleProjectStatus: (projectId: string) => void;
  addTask: (values: TaskFormValues) => void;
  updateTask: (taskId: string, values: TaskFormValues) => void;
  addTaskColumn: (values: TaskColumnFormValues) => void;
  removeTaskColumn: (columnId: string) => void;
  moveTaskToColumn: (taskId: string, columnId: string) => void;
  moveTaskOnBoard: (taskId: string, columnId: string, beforeTaskId?: string) => void;
  archiveTask: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  toggleTaskDone: (taskId: string) => void;
  setTaskCycleAssignment: (taskId: string, cycleAssignment: Task['cycleAssignment']) => void;
  completeTask: (taskId: string) => void;
  skipTaskToNextCycle: (taskId: string, strategy?: 'reset-to-backlog' | 'keep-stage') => void;
  setTodayCycleValues: (values: TodayCycleValues) => void;
  setTodayActualHours: (actualHours: Record<string, number>) => void;
  setOperationalSettings: (settings: UpdateUserSettingsInput) => void;
  resetWorkspaceStore: () => void;
}

export const useWorkspaceStore = create<WorkspaceStoreState>((set, get) => ({
  ...createInitialWorkspaceState(),
  startSession: (projectId) => set((state) => {
    const currentDate = getTodayISODate();
    const shouldRollToCurrentDate = currentDate > state.cycleDate;
    const nextDate = shouldRollToCurrentDate ? currentDate : state.cycleDate;

    if (state.sessionState !== 'idle') return state;
    const now = new Date().toISOString();

    const activeProjects = state.projects.filter((project) => project.status === 'active');
    const projectLoadSummary = getProjectLoadSummary(state.tasks, activeProjects);
    const allocations = buildSuggestedAllocations(activeProjects, projectLoadSummary, state.todayCycleValues);

    return {
      sessionState: 'running',
      activeProjectId: projectId,
      sessionStartedAt: now,
      todayActualHours: createActualHoursMap(allocations),
      cycleDate: nextDate,
      cycleState: 'ACTIVE',
      timeBlocks: [{ projectId, startedAt: now, endedAt: null, confirmedMinutes: 0 }],
      pulseHistory: shouldRollToCurrentDate ? [] : state.pulseHistory,
      activePulse: null,
      nextPulseDueAt: addMinutesToTimestamp(now, DEFAULT_PULSE_INTERVAL_MINUTES),
      regularizationState: { isOpen: false, highlightedPulseIndex: null },
      closeDayReview: null,
      rolloverNotice: null,
      deferNextCycleUntilManualStart: false,
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
      activePulse: null,
      nextPulseDueAt: null,
    };
  }),
  resumeSession: () => set((state) => {
    if (state.sessionState !== 'paused_manual' && state.sessionState !== 'paused_inactivity') return state;
    if (!state.activeProjectId) return state;
    const now = new Date().toISOString();
    const shouldPromptRegularization = state.sessionState === 'paused_inactivity';
    return {
      sessionState: 'running',
      timeBlocks: [...state.timeBlocks, { projectId: state.activeProjectId, startedAt: now, endedAt: null, confirmedMinutes: 0 }],
      nextPulseDueAt: addMinutesToTimestamp(now, DEFAULT_PULSE_INTERVAL_MINUTES),
      activePulse: null,
      regularizationState: shouldPromptRegularization
        ? { isOpen: true, highlightedPulseIndex: state.pulseHistory.length - 1 }
        : state.regularizationState,
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
      activePulse: null,
      nextPulseDueAt: null,
    };
  }),
  autoCloseCycle: (boundaryAt, options) => set((state) => {
    if (state.cycleState === 'AUTO_CLOSED') {
      return state;
    }

    const closedAt = boundaryAt ?? new Date().toISOString();
    const updatedTimeBlocks = state.timeBlocks.map((block) => (
      block.endedAt === null ? { ...block, endedAt: closedAt } : block
    ));
    const cycleSnapshot = computeCycleSnapshot({
      tasks: state.tasks,
      timeBlocks: updatedTimeBlocks,
      todayCycleValues: state.todayCycleValues,
    });

    return {
      sessionState: 'completed',
      cycleState: 'AUTO_CLOSED',
      cycleSnapshot,
      timeBlocks: updatedTimeBlocks,
      activePulse: null,
      nextPulseDueAt: null,
      previousCycleSummary: {
        cycleDate: state.cycleDate,
        snapshot: cycleSnapshot,
        activeProjectId: state.activeProjectId,
        inProgressTaskIds: state.tasks.filter((task) => task.cycleAssignment === 'current' && task.status !== 'done' && !task.isArchived).map((task) => task.id),
      },
      deferNextCycleUntilManualStart: options?.deferNextCycleUntilManualStart ?? false,
    };
  }),
  startNextCycle: (options) => set((state) => {
    const nextDate = options?.nextDate ?? getTodayISODate();
    const nextProjectId = options?.keepActiveProject ? state.activeProjectId : null;
    const shouldContinueSession = Boolean(options?.continueSession && nextProjectId);
    const startedAt = options?.startedAt ?? new Date().toISOString();
    const activeProjects = state.projects.filter((project) => project.status === 'active');
    const projectLoadSummary = getProjectLoadSummary(state.tasks, activeProjects);
    const allocations = buildSuggestedAllocations(activeProjects, projectLoadSummary, state.todayCycleValues);

    return {
      todayActualHours: createActualHoursMap(allocations),
      sessionState: shouldContinueSession ? 'running' : 'idle',
      sessionStartedAt: shouldContinueSession ? startedAt : null,
      activeProjectId: nextProjectId,
      timeBlocks: shouldContinueSession && nextProjectId ? [{ projectId: nextProjectId, startedAt, endedAt: null, confirmedMinutes: 0 }] : [],
      pulseHistory: [],
      activePulse: null,
      nextPulseDueAt: shouldContinueSession ? addMinutesToTimestamp(startedAt, DEFAULT_PULSE_INTERVAL_MINUTES) : null,
      regularizationState: { isOpen: false, highlightedPulseIndex: null },
      closeDayReview: null,
      cycleDate: nextDate,
      cycleState: shouldContinueSession ? 'ACTIVE' : 'PLANNED',
      cycleSnapshot: null,
      rolloverNotice: state.previousCycleSummary
        ? {
          previousCycleDate: state.previousCycleSummary.cycleDate,
          title: 'Novo dia pronto. O ciclo anterior foi encerrado automaticamente',
          description: 'Voce ja esta no novo dia. Se quiser, revise o fechamento anterior para confirmar blocos, entender lacunas ou retomar o contexto que ficou em andamento.',
        }
        : state.rolloverNotice,
      deferNextCycleUntilManualStart: false,
    };
  }),
  syncCycleBoundary: (currentAt) => set((state) => {
    const now = currentAt ? new Date(currentAt) : new Date();
    const currentDate = getLocalISODate(now);

    if (currentDate <= state.cycleDate || state.deferNextCycleUntilManualStart) {
      return state;
    }

    const boundaryAt = getCycleBoundaryTimestamp(state.cycleDate);
    const updatedTimeBlocks = state.timeBlocks.map((block) => (
      block.endedAt === null ? { ...block, endedAt: boundaryAt } : block
    ));
    const cycleSnapshot = computeCycleSnapshot({
      tasks: state.tasks,
      timeBlocks: updatedTimeBlocks,
      todayCycleValues: state.todayCycleValues,
    });
    const activeProjects = state.projects.filter((project) => project.status === 'active');
    const projectLoadSummary = getProjectLoadSummary(state.tasks, activeProjects);
    const allocations = buildSuggestedAllocations(activeProjects, projectLoadSummary, state.todayCycleValues);

    return {
      todayActualHours: createActualHoursMap(allocations),
      sessionState: 'idle',
      sessionStartedAt: null,
      activeProjectId: null,
      timeBlocks: [],
      pulseHistory: [],
      activePulse: null,
      nextPulseDueAt: null,
      regularizationState: { isOpen: false, highlightedPulseIndex: null },
      closeDayReview: null,
      cycleDate: currentDate,
      cycleState: 'PLANNED',
      cycleSnapshot: null,
      previousCycleSummary: {
        cycleDate: state.cycleDate,
        snapshot: cycleSnapshot,
        activeProjectId: state.activeProjectId,
        inProgressTaskIds: state.tasks.filter((task) => task.cycleAssignment === 'current' && task.status !== 'done' && !task.isArchived).map((task) => task.id),
      },
      rolloverNotice: {
        previousCycleDate: state.cycleDate,
        title: 'Novo dia pronto. O ciclo anterior foi encerrado automaticamente',
        description: 'Voce voltou depois da meia-noite. O dia anterior foi fechado na virada e o novo ciclo ja esta preparado para comecar.',
      },
      deferNextCycleUntilManualStart: false,
    };
  }),
  clearRolloverNotice: () => set({ rolloverNotice: null }),
  setCycleState: (cycleState) => set({ cycleState }),
  recordPulse: (status) => set((state) => {
    const now = new Date().toISOString();
    return {
      pulseHistory: [
        ...state.pulseHistory,
        {
          firedAt: now,
          respondedAt: status === 'confirmed' ? now : null,
          status,
          projectId: state.activeProjectId,
          resolution: status === 'confirmed' ? 'confirmed' : 'pending',
          reviewedAt: status === 'confirmed' ? now : null,
          confirmedMinutes: status === 'confirmed' ? DEFAULT_PULSE_INTERVAL_MINUTES : 0,
        },
      ],
    };
  }),
  firePulse: (firedAt) => set((state) => {
    if (state.sessionState !== 'running' || state.activePulse) {
      return state;
    }

    const startedAt = firedAt ?? new Date().toISOString();

    return {
      activePulse: {
        firedAt: startedAt,
        expiresAt: addMinutesToTimestamp(startedAt, DEFAULT_PULSE_RESPONSE_WINDOW_MINUTES),
        projectId: state.activeProjectId,
      },
      nextPulseDueAt: null,
    };
  }),
  confirmActivePulse: (respondedAt) => set((state) => {
    if (!state.activePulse) {
      return state;
    }

    const resolvedAt = respondedAt ?? new Date().toISOString();
    const pulseHistory = [
      ...state.pulseHistory,
      {
        firedAt: state.activePulse.firedAt,
        respondedAt: resolvedAt,
        status: 'confirmed' as const,
        projectId: state.activePulse.projectId,
        resolution: 'confirmed' as const,
        reviewedAt: resolvedAt,
        confirmedMinutes: DEFAULT_PULSE_INTERVAL_MINUTES,
      },
    ];

    return {
      activePulse: null,
      nextPulseDueAt: addMinutesToTimestamp(resolvedAt, DEFAULT_PULSE_INTERVAL_MINUTES),
      pulseHistory,
      timeBlocks: applyConfirmedMinutesToTimeBlocks(
        state.timeBlocks,
        state.activePulse.firedAt,
        DEFAULT_PULSE_INTERVAL_MINUTES,
        resolvedAt,
      ),
      closeDayReview: buildCloseDayReview(pulseHistory),
    };
  }),
  expireActivePulse: (expiredAt) => set((state) => {
    if (state.sessionState !== 'running' || !state.activePulse) {
      return state;
    }

    const resolvedAt = expiredAt ?? new Date().toISOString();
    const pulseHistory = [
      ...state.pulseHistory,
      {
        firedAt: state.activePulse.firedAt,
        respondedAt: null,
        status: 'unconfirmed' as const,
        projectId: state.activePulse.projectId,
        resolution: 'pending' as const,
        reviewedAt: null,
        confirmedMinutes: 0,
      },
    ];

    return {
      sessionState: 'paused_inactivity',
      activePulse: null,
      nextPulseDueAt: null,
      pulseHistory,
      closeDayReview: buildCloseDayReview(pulseHistory),
      timeBlocks: state.timeBlocks.map((block) =>
        block.endedAt === null ? { ...block, endedAt: resolvedAt } : block,
      ),
    };
  }),
  openRegularizationPanel: (pulseIndex) => set({
    regularizationState: {
      isOpen: true,
      highlightedPulseIndex: pulseIndex ?? null,
    },
  }),
  closeRegularizationPanel: () => set({
    regularizationState: {
      isOpen: false,
      highlightedPulseIndex: null,
    },
  }),
  reviewPulse: (pulseIndex, resolution, reviewedAt) => set((state) => {
    const pulse = state.pulseHistory[pulseIndex];

    if (!pulse) {
      return state;
    }

    const resolvedAt = reviewedAt ?? new Date().toISOString();
    const didGainConfirmedMinutes = pulse.status === 'unconfirmed' && pulse.resolution !== 'confirmed' && resolution === 'confirmed';
    const pulseHistory = state.pulseHistory.map((item, index) => {
      if (index !== pulseIndex) {
        return item;
      }

      return {
        ...item,
        respondedAt: resolution === 'confirmed' ? item.respondedAt ?? resolvedAt : item.respondedAt,
        resolution,
        reviewedAt: resolvedAt,
        confirmedMinutes: resolution === 'confirmed' ? DEFAULT_PULSE_INTERVAL_MINUTES : 0,
      };
    });

    return {
      pulseHistory,
      timeBlocks: didGainConfirmedMinutes
        ? applyConfirmedMinutesToTimeBlocks(
          state.timeBlocks,
          pulse.firedAt,
          DEFAULT_PULSE_INTERVAL_MINUTES,
          resolvedAt,
        )
        : state.timeBlocks,
      closeDayReview: buildCloseDayReview(pulseHistory),
    };
  }),
  updateTimeBlock: (timeBlockIndex, updates) => set((state) => ({
    timeBlocks: state.timeBlocks.map((timeBlock, index) => (
      index === timeBlockIndex
        ? { ...timeBlock, ...updates }
        : timeBlock
    )),
  })),
  prepareCloseDayReview: () => {
    const review = buildCloseDayReview(get().pulseHistory);

    set({ closeDayReview: review });

    return review;
  },
  replaceProjects: (projects) => set({ projects: projects.map(cloneProject) }),
  replaceTasks: (tasks) => set({ tasks: tasks.map(cloneTask) }),
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
          ? { ...task, columnId: targetColumn.id, status: targetColumn.status, nextCycleStartDate: null }
          : task
      )),
    };
  }),
  moveTaskOnBoard: (taskId, columnId, beforeTaskId) => set((state) => {
    const targetColumn = state.taskColumns.find((column) => column.id === columnId);
    const sourceTask = state.tasks.find((task) => task.id === taskId);

    if (!targetColumn || !sourceTask || beforeTaskId === taskId) {
      return state;
    }

    const movedTask = {
      ...sourceTask,
      columnId: targetColumn.id,
      status: targetColumn.status,
      nextCycleStartDate: null,
    };

    const remainingTasks = state.tasks.filter((task) => task.id !== taskId);
    let insertionIndex = beforeTaskId ? remainingTasks.findIndex((task) => task.id === beforeTaskId) : -1;

    if (insertionIndex < 0) {
      insertionIndex = remainingTasks.reduce((lastIndex, task, index) => (
        task.columnId === targetColumn.id ? index + 1 : lastIndex
      ), 0);
    }

    return {
      tasks: [
        ...remainingTasks.slice(0, insertionIndex),
        movedTask,
        ...remainingTasks.slice(insertionIndex),
      ],
    };
  }),
  archiveTask: (taskId) => set((state) => ({
    tasks: state.tasks.map((task) => (
      task.id === taskId
        ? { ...task, isArchived: true, cycleAssignment: 'backlog', nextCycleStartDate: null }
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
          nextCycleStartDate: null,
        }
        : task
    )),
  })),
  setTaskCycleAssignment: (taskId, cycleAssignment) => set((state) => ({
    tasks: state.tasks.map((task) => (
      task.id === taskId
        ? { ...task, cycleAssignment, nextCycleStartDate: cycleAssignment === 'next' ? task.nextCycleStartDate ?? null : null }
        : task
    )),
  })),
  completeTask: (taskId) => set((state) => ({
    tasks: state.tasks.map((task) => (
      task.id === taskId
        ? { ...task, status: 'done', columnId: getColumnIdForStatus(state.taskColumns, 'done'), cycleAssignment: 'backlog', isArchived: false, nextCycleStartDate: null }
        : task
    )),
  })),
  skipTaskToNextCycle: (taskId, strategy = 'keep-stage') => set((state) => ({
    tasks: state.tasks.map((task) => {
      if (task.id !== taskId) {
        return task;
      }

      if (strategy === 'reset-to-backlog') {
        return {
          ...task,
          cycleAssignment: 'next',
          status: 'todo',
          columnId: getColumnIdForStatus(state.taskColumns, 'todo'),
          nextCycleStartDate: getTomorrowISODate(),
        };
      }

      return {
        ...task,
        cycleAssignment: 'next',
        nextCycleStartDate: getTomorrowISODate(),
      };
    }),
  })),
  setTodayCycleValues: (values) => set({ todayCycleValues: values }),
  setTodayActualHours: (actualHours) => set({ todayActualHours: actualHours }),
  setOperationalSettings: (settings) => set((state) => ({
    operationalSettings: {
      ...state.operationalSettings,
      ...settings,
    },
  })),
  resetWorkspaceStore: () => set(createInitialWorkspaceState()),
}));

export function resetWorkspaceStore() {
  useWorkspaceStore.getState().resetWorkspaceStore();
}