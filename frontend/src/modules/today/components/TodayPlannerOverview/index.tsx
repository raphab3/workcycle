'use client';

import { AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';

import { getApiErrorMessage } from '@/lib/apiError';
import { useAuthStore } from '@/modules/auth/store/useAuthStore';
import { useProjectsQuery } from '@/modules/projects/queries/useProjectsQuery';
import type { Project } from '@/modules/projects/types';
import { TaskForm } from '@/modules/tasks/components/TaskForm';
import { useTasksQuery } from '@/modules/tasks/queries/useTasksQuery';
import { useUpdateTaskMutation } from '@/modules/tasks/queries/useUpdateTaskMutation';
import { useUpdateTaskStatusMutation } from '@/modules/tasks/queries/useUpdateTaskStatusMutation';
import type { PersistedTaskValues, Task } from '@/modules/tasks/types';
import { getProjectLoadSummary } from '@/modules/tasks/utils/tasks';
import { useActivityPulse } from '@/modules/today/hooks/useActivityPulse';
import { todayKeys } from '@/modules/today/queries/todayKeys';
import { useFirePulseMutation } from '@/modules/today/queries/useFirePulseMutation';
import { useTodaySessionQuery } from '@/modules/today/queries/useTodaySessionQuery';
import { useUpdateTodaySessionMutation } from '@/modules/today/queries/useUpdateTodaySessionMutation';
import { todayService } from '@/modules/today/services/todayService';
import type { PulseRecord, TimeBlock, TodayCycleValues } from '@/modules/today/types';
import { getCycleBoundaryTimestamp, getLocalISODate, hasCrossedCycleBoundary, isWithinRolloverWindow } from '@/modules/today/utils/boundary';
import { buildCloseDayReview, getTimeBlockDurationInMinutes } from '@/modules/today/utils/pulse';
import { buildSuggestedAllocations, formatHours } from '@/modules/today/utils/planner';
import { Button } from '@/shared/components/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/Card';
import { EmptyState } from '@/shared/components/EmptyState';
import { OverlayPanel } from '@/shared/components/OverlayPanel';
import { StateNotice } from '@/shared/components/StateNotice';
import { useWorkspaceStore } from '@/shared/store/useWorkspaceStore';
import { cn } from '@/shared/utils/cn';

import { CycleTasksBoard } from '../CycleTasksBoard/index';
import { TodayCycleForm } from '../TodayCycleForm/index';
import { todayPlannerOverviewStyles } from './styles';

type DrawerMode = 'close' | 'review' | null;

function formatClock(timestamp: string | null) {
  if (!timestamp) {
    return '--:--';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp));
}

function formatMinutes(minutes: number) {
  const roundedMinutes = Math.max(0, Math.round(minutes));
  const hours = Math.floor(roundedMinutes / 60);
  const remainingMinutes = roundedMinutes % 60;

  return `${hours}h${String(remainingMinutes).padStart(2, '0')}`;
}

function getCountdownLabel(targetTimestamp: string | null, currentTime: Date) {
  if (!targetTimestamp) {
    return '--';
  }

  const differenceInMinutes = Math.max(0, Math.ceil((new Date(targetTimestamp).getTime() - currentTime.getTime()) / 60_000));

  return `${differenceInMinutes}min`;
}

function buildTrackedHoursByProject(timeBlocks: TimeBlock[], currentTime: Date) {
  return timeBlocks.reduce<Record<string, number>>((hoursByProject, timeBlock) => {
    const trackedHours = getTimeBlockDurationInMinutes(timeBlock, currentTime.toISOString()) / 60;

    return {
      ...hoursByProject,
      [timeBlock.projectId]: Number(((hoursByProject[timeBlock.projectId] ?? 0) + trackedHours).toFixed(1)),
    };
  }, {});
}

function buildConfirmedHoursByProject(timeBlocks: TimeBlock[]) {
  return timeBlocks.reduce<Record<string, number>>((hoursByProject, timeBlock) => ({
    ...hoursByProject,
    [timeBlock.projectId]: Number(((hoursByProject[timeBlock.projectId] ?? 0) + timeBlock.confirmedMinutes / 60).toFixed(1)),
  }), {});
}

function getPendingPulseIndex(pulseHistory: PulseRecord[]) {
  for (let index = pulseHistory.length - 1; index >= 0; index -= 1) {
    if (pulseHistory[index]?.resolution === 'pending') {
      return index;
    }
  }

  return null;
}

function buildDraftActualHours(projects: Project[], trackedHoursByProject: Record<string, number>) {
  return Object.fromEntries(projects.map((project) => [project.id, trackedHoursByProject[project.id] ?? 0]));
}

function toSessionTimeBlocks(timeBlocks: TimeBlock[]) {
  return timeBlocks.map((timeBlock) => ({
    confirmedMinutes: timeBlock.confirmedMinutes,
    endedAt: timeBlock.endedAt,
    projectId: timeBlock.projectId,
    startedAt: timeBlock.startedAt,
  }));
}

function closeOpenTimeBlocks(timeBlocks: TimeBlock[], endedAt: string) {
  return timeBlocks.map((timeBlock) => (
    timeBlock.endedAt === null ? { ...timeBlock, endedAt } : timeBlock
  ));
}

function appendTimeBlock(timeBlocks: TimeBlock[], projectId: string, startedAt: string) {
  return [
    ...timeBlocks,
    {
      confirmedMinutes: 0,
      endedAt: null,
      projectId,
      startedAt,
    },
  ];
}

function switchProjectTimeBlocks(timeBlocks: TimeBlock[], projectId: string, switchedAt: string) {
  return [
    ...closeOpenTimeBlocks(timeBlocks, switchedAt),
    {
      confirmedMinutes: 0,
      endedAt: null,
      projectId,
      startedAt: switchedAt,
    },
  ];
}

function buildCycleSnapshot(tasks: Task[], timeBlocks: TimeBlock[], plannedHours: number) {
  const currentTasks = tasks.filter((task) => task.cycleAssignment === 'current' && !task.isArchived);

  return {
    actualHours: Number((timeBlocks.reduce((total, timeBlock) => total + timeBlock.confirmedMinutes, 0) / 60).toFixed(1)),
    completedTaskIds: currentTasks.filter((task) => task.status === 'done').map((task) => task.id),
    incompleteTaskIds: currentTasks.filter((task) => task.status !== 'done').map((task) => task.id),
    plannedHours: Number(plannedHours.toFixed(1)),
  };
}

function applyDraftActualHoursToTimeBlocks(timeBlocks: TimeBlock[], draftActualHours: Record<string, number>, referenceTimestamp: string) {
  const remainingMinutesByProject = Object.fromEntries(
    Object.entries(draftActualHours).map(([projectId, hours]) => [projectId, Math.max(0, Math.round(hours * 60))]),
  );

  return timeBlocks.map((timeBlock) => {
    const trackedMinutes = getTimeBlockDurationInMinutes(timeBlock, referenceTimestamp);
    const remainingMinutes = remainingMinutesByProject[timeBlock.projectId] ?? 0;
    const confirmedMinutes = Math.min(trackedMinutes, remainingMinutes);

    remainingMinutesByProject[timeBlock.projectId] = Math.max(0, remainingMinutes - confirmedMinutes);

    return {
      ...timeBlock,
      confirmedMinutes,
    };
  });
}

function getRhythmStatus(realHours: number, plannedHours: number, hasPendingReview: boolean) {
  if (hasPendingReview) {
    return { label: 'Atencao', tone: 'warning' as const };
  }

  if (plannedHours === 0) {
    return { label: 'Sem plano', tone: 'neutral' as const };
  }

  const completionRatio = realHours / plannedHours;

  if (completionRatio > 1.05) {
    return { label: 'Acima do plano', tone: 'danger' as const };
  }

  if (completionRatio >= 0.45) {
    return { label: 'No ritmo', tone: 'positive' as const };
  }

  return { label: 'Atrasado', tone: 'warning' as const };
}

export function TodayPlannerOverview() {
  useActivityPulse();

  const queryClient = useQueryClient();
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [selectedCycleDate, setSelectedCycleDate] = useState<string | undefined>(undefined);
  const [isPlanExpanded, setIsPlanExpanded] = useState(true);
  const [isProjectPickerOpen, setIsProjectPickerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null);
  const [isRolloverPromptOpen, setIsRolloverPromptOpen] = useState(false);
  const [keepSameProjectOnRollover, setKeepSameProjectOnRollover] = useState(true);
  const [taskDrawerTaskId, setTaskDrawerTaskId] = useState<string | null>(null);
  const [draftActualHours, setDraftActualHours] = useState<Record<string, number>>({});
  const rolloverPromptCycleRef = useRef<string | null>(null);
  const hasHydratedSession = useAuthStore((state) => state.hasHydrated);
  const sessionStatus = useAuthStore((state) => state.sessionStatus);
  const isAuthenticated = hasHydratedSession && sessionStatus === 'authenticated';
  const projectsQuery = useProjectsQuery({ enabled: isAuthenticated });
  const tasksQuery = useTasksQuery({ enabled: isAuthenticated });
  const todaySessionQuery = useTodaySessionQuery({ cycleDate: selectedCycleDate, enabled: isAuthenticated });
  const updateTodaySessionMutation = useUpdateTodaySessionMutation();
  const firePulseMutation = useFirePulseMutation();
  const updateTaskMutation = useUpdateTaskMutation();
  const updateTaskStatusMutation = useUpdateTaskStatusMutation();

  const projects = useWorkspaceStore((state) => state.projects);
  const taskColumns = useWorkspaceStore((state) => state.taskColumns);
  const tasks = useWorkspaceStore((state) => state.tasks);
  const todaySessionId = useWorkspaceStore((state) => state.todaySessionId);
  const cycleValues = useWorkspaceStore((state) => state.todayCycleValues);
  const todayActualHours = useWorkspaceStore((state) => state.todayActualHours);
  const sessionState = useWorkspaceStore((state) => state.sessionState);
  const sessionStartedAt = useWorkspaceStore((state) => state.sessionStartedAt);
  const activeProjectId = useWorkspaceStore((state) => state.activeProjectId);
  const timeBlocks = useWorkspaceStore((state) => state.timeBlocks);
  const pulseHistory = useWorkspaceStore((state) => state.pulseHistory);
  const activePulse = useWorkspaceStore((state) => state.activePulse);
  const nextPulseDueAt = useWorkspaceStore((state) => state.nextPulseDueAt);
  const regularizationState = useWorkspaceStore((state) => state.regularizationState);
  const closeDayReview = useWorkspaceStore((state) => state.closeDayReview);
  const cycleDate = useWorkspaceStore((state) => state.cycleDate);
  const cycleState = useWorkspaceStore((state) => state.cycleState);
  const cycleSnapshot = useWorkspaceStore((state) => state.cycleSnapshot);
  const rolloverNotice = useWorkspaceStore((state) => state.rolloverNotice);
  const replaceProjects = useWorkspaceStore((state) => state.replaceProjects);
  const replaceTasks = useWorkspaceStore((state) => state.replaceTasks);
  const replaceTodaySession = useWorkspaceStore((state) => state.replaceTodaySession);
  const setTodayCycleValues = useWorkspaceStore((state) => state.setTodayCycleValues);
  const setTodayActualHours = useWorkspaceStore((state) => state.setTodayActualHours);
  const startSession = useWorkspaceStore((state) => state.startSession);
  const pauseSession = useWorkspaceStore((state) => state.pauseSession);
  const resumeSession = useWorkspaceStore((state) => state.resumeSession);
  const switchActiveProject = useWorkspaceStore((state) => state.switchActiveProject);
  const moveTaskOnBoard = useWorkspaceStore((state) => state.moveTaskOnBoard);
  const skipTaskToNextCycle = useWorkspaceStore((state) => state.skipTaskToNextCycle);
  const updateTask = useWorkspaceStore((state) => state.updateTask);
  const autoCloseCycle = useWorkspaceStore((state) => state.autoCloseCycle);
  const startNextCycle = useWorkspaceStore((state) => state.startNextCycle);
  const syncCycleBoundary = useWorkspaceStore((state) => state.syncCycleBoundary);
  const clearRolloverNotice = useWorkspaceStore((state) => state.clearRolloverNotice);
  const closeDay = useWorkspaceStore((state) => state.closeDay);
  const prepareCloseDayReview = useWorkspaceStore((state) => state.prepareCloseDayReview);
  const openRegularizationPanel = useWorkspaceStore((state) => state.openRegularizationPanel);
  const closeRegularizationPanel = useWorkspaceStore((state) => state.closeRegularizationPanel);
  const reviewPulse = useWorkspaceStore((state) => state.reviewPulse);
  const updateTimeBlock = useWorkspaceStore((state) => state.updateTimeBlock);
  const confirmActivePulse = useWorkspaceStore((state) => state.confirmActivePulse);

  useEffect(() => {
    if (!isAuthenticated || !projectsQuery.data) {
      return;
    }

    replaceProjects(projectsQuery.data);
  }, [isAuthenticated, projectsQuery.data, replaceProjects]);

  useEffect(() => {
    if (!isAuthenticated || !tasksQuery.data) {
      return;
    }

    replaceTasks(tasksQuery.data);
  }, [isAuthenticated, replaceTasks, tasksQuery.data]);

  useEffect(() => {
    if (!isAuthenticated || !todaySessionQuery.data) {
      return;
    }

    replaceTodaySession(todaySessionQuery.data);
  }, [isAuthenticated, replaceTodaySession, todaySessionQuery.data]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 1_000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (sessionState !== 'idle' && sessionState !== 'completed') {
      const timeoutId = window.setTimeout(() => {
        setIsPlanExpanded(false);
      }, 0);

      return () => {
        window.clearTimeout(timeoutId);
      };
    }

    return undefined;
  }, [sessionState]);

  const requestError = projectsQuery.error
    ?? tasksQuery.error
    ?? todaySessionQuery.error
    ?? updateTodaySessionMutation.error
    ?? firePulseMutation.error
    ?? updateTaskMutation.error
    ?? updateTaskStatusMutation.error;
  const requestErrorMessage = requestError
    ? getApiErrorMessage(requestError, 'Nao foi possivel sincronizar o cockpit operacional com o backend.')
    : null;
  const isInitialSyncingToday = isAuthenticated && (
    (projectsQuery.isPending && !projectsQuery.data)
    || (tasksQuery.isPending && !tasksQuery.data)
    || (todaySessionQuery.isPending && !todaySessionQuery.data)
  );
  const isRefetchingToday = isAuthenticated && (
    (projectsQuery.isRefetching && !projectsQuery.isPending)
    || (tasksQuery.isRefetching && !tasksQuery.isPending)
    || (todaySessionQuery.isRefetching && !todaySessionQuery.isPending)
  );
  const isMutatingToday = updateTodaySessionMutation.isPending || firePulseMutation.isPending || updateTaskMutation.isPending || updateTaskStatusMutation.isPending;

  useEffect(() => {
    const hasActiveSession = sessionState === 'running' || sessionState === 'paused_manual' || sessionState === 'paused_inactivity';

    if (hasCrossedCycleBoundary(currentTime, cycleDate)) {
      if (isAuthenticated) {
        if (!selectedCycleDate) {
          void todaySessionQuery.refetch();
        }
        return;
      }

      syncCycleBoundary(currentTime.toISOString());
      return;
    }

    if (!hasActiveSession || cycleState === 'AUTO_CLOSED') {
      return;
    }

    if (isWithinRolloverWindow(currentTime, cycleDate) && rolloverPromptCycleRef.current !== cycleDate) {
      const timeoutId = window.setTimeout(() => {
        rolloverPromptCycleRef.current = cycleDate;
        setKeepSameProjectOnRollover(Boolean(activeProjectId));
        setIsRolloverPromptOpen(true);
      }, 0);

      return () => {
        window.clearTimeout(timeoutId);
      };
    }

    return undefined;
  }, [activeProjectId, currentTime, cycleDate, cycleState, isAuthenticated, selectedCycleDate, sessionState, syncCycleBoundary, todaySessionQuery]);

  const activeProjects = useMemo(() => projects.filter((project) => project.status === 'active'), [projects]);
  const projectLoadSummary = useMemo(() => getProjectLoadSummary(tasks, activeProjects), [tasks, activeProjects]);
  const allocations = useMemo(
    () => buildSuggestedAllocations(activeProjects, projectLoadSummary, cycleValues),
    [activeProjects, cycleValues, projectLoadSummary],
  );
  const trackedHoursByProject = useMemo(() => buildTrackedHoursByProject(timeBlocks, currentTime), [currentTime, timeBlocks]);
  const confirmedHoursByProject = useMemo(() => buildConfirmedHoursByProject(timeBlocks), [timeBlocks]);
  const allocationMap = useMemo(() => new Map(allocations.map((allocation) => [allocation.projectId, allocation])), [allocations]);
  const activeProject = activeProjects.find((project) => project.id === activeProjectId) ?? null;
  const activeAllocation = activeProjectId ? allocationMap.get(activeProjectId) ?? null : null;
  const totalTrackedHours = Number(Object.values(trackedHoursByProject).reduce((total, value) => total + value, 0).toFixed(1));
  const totalConfirmedHours = Number(Object.values(confirmedHoursByProject).reduce((total, value) => total + value, 0).toFixed(1));
  const totalPlannedHours = Number(allocations.reduce((total, allocation) => total + allocation.plannedHours, 0).toFixed(1));
  const resolvedCloseDayReview = closeDayReview ?? buildCloseDayReview(pulseHistory);
  const rhythmStatus = getRhythmStatus(totalTrackedHours, totalPlannedHours, resolvedCloseDayReview.requiresConfirmation);
  const completedTasksCount = cycleSnapshot?.completedTaskIds.length ?? tasks.filter((task) => task.status === 'done' && task.cycleAssignment === 'current').length;
  const daySummaryHours = sessionState === 'completed'
    ? Number(Object.values(todayActualHours).reduce((total, value) => total + value, 0).toFixed(1))
    : totalTrackedHours;
  const pulseTargetTimestamp = activePulse?.expiresAt ?? nextPulseDueAt;
  const pulseLabel = activePulse ? 'Resposta do pulso' : 'Proximo pulso';
  const activeProjectTrackedHours = activeProjectId ? trackedHoursByProject[activeProjectId] ?? 0 : 0;
  const activeProjectPlannedHours = activeAllocation?.plannedHours ?? 0;
  const taskDrawerTask = useMemo<Task | null>(() => tasks.find((task) => task.id === taskDrawerTaskId) ?? null, [taskDrawerTaskId, tasks]);

  async function mutateTodaySession(input: Parameters<typeof updateTodaySessionMutation.mutateAsync>[0]) {
    return updateTodaySessionMutation.mutateAsync({
      cycleDate: selectedCycleDate,
      sessionId: todaySessionId ?? undefined,
      ...input,
    });
  }

  async function handleSelectProject(projectId: string) {
    if (isAuthenticated && todaySessionId) {
      if (sessionState === 'running' && projectId !== activeProjectId) {
        const switchedAt = new Date().toISOString();

        await mutateTodaySession({
          activeProjectId: projectId,
          state: 'running',
          timeBlocks: toSessionTimeBlocks(switchProjectTimeBlocks(timeBlocks, projectId, switchedAt)),
        });
      } else {
        await mutateTodaySession({ activeProjectId: projectId });
      }

      setIsProjectPickerOpen(false);
      return;
    }

    switchActiveProject(projectId);
    setIsProjectPickerOpen(false);
  }

  function handleSubmitCycle(values: TodayCycleValues) {
    setTodayCycleValues(values);
  }

  async function handleStartSession() {
    if (!activeProjectId) {
      return;
    }

    if (isAuthenticated && todaySessionId) {
      const startedAt = new Date().toISOString();

      await mutateTodaySession({
        activeProjectId,
        startedAt,
        state: 'running',
        timeBlocks: toSessionTimeBlocks(appendTimeBlock([], activeProjectId, startedAt)),
      });
      setIsPlanExpanded(false);
      return;
    }

    startSession(activeProjectId);
    setIsPlanExpanded(false);
  }

  function openDrawer(mode: Exclude<DrawerMode, null>) {
    prepareCloseDayReview();
    setDraftActualHours(buildDraftActualHours(activeProjects, trackedHoursByProject));
    setDrawerMode(mode);

    if (mode === 'review') {
      openRegularizationPanel(getPendingPulseIndex(pulseHistory) ?? undefined);
    }
  }

  function handleCloseDrawer() {
    setDrawerMode(null);
    closeRegularizationPanel();
  }

  async function handleConfirmCloseDay() {
    if (isAuthenticated && todaySessionId) {
      const closedAt = new Date().toISOString();
      const finalizedTimeBlocks = applyDraftActualHoursToTimeBlocks(closeOpenTimeBlocks(timeBlocks, closedAt), draftActualHours, closedAt);

      await mutateTodaySession({
        closedAt,
        snapshot: {
          ...buildCycleSnapshot(tasks, finalizedTimeBlocks, totalPlannedHours),
          actualHours: Number(Object.values(draftActualHours).reduce((total, value) => total + value, 0).toFixed(1)),
        },
        state: 'completed',
        timeBlocks: toSessionTimeBlocks(finalizedTimeBlocks),
      });
      handleCloseDrawer();
      return;
    }

    setTodayActualHours(draftActualHours);
    closeDay();
    handleCloseDrawer();
  }

  function handleAdjustDraftHours(projectId: string, delta: number) {
    setDraftActualHours((currentHours) => ({
      ...currentHours,
      [projectId]: Math.max(0, Number(((currentHours[projectId] ?? trackedHoursByProject[projectId] ?? 0) + delta).toFixed(1))),
    }));
  }

  async function handleSubmitTaskUpdate(values: Parameters<typeof updateTask>[1]) {
    if (!taskDrawerTaskId) {
      return;
    }

    if (isAuthenticated) {
      const persistedValues: PersistedTaskValues = {
        ...values,
        cycleSessionId: values.cycleAssignment === 'current'
          ? taskDrawerTask?.cycleSessionId ?? todaySessionId ?? null
          : null,
      };

      if (persistedValues.cycleAssignment === 'current' && !persistedValues.cycleSessionId) {
        return;
      }

      await updateTaskMutation.mutateAsync({
        taskId: taskDrawerTaskId,
        values: persistedValues,
      });
      return;
    }

    updateTask(taskDrawerTaskId, values);
  }

  async function handlePauseSession() {
    if (isAuthenticated && todaySessionId) {
      const pausedAt = new Date().toISOString();

      await mutateTodaySession({
        state: 'paused_manual',
        timeBlocks: toSessionTimeBlocks(closeOpenTimeBlocks(timeBlocks, pausedAt)),
      });
      return;
    }

    pauseSession('manual');
  }

  async function handleResumeSession() {
    if (!activeProjectId) {
      return;
    }

    if (isAuthenticated && todaySessionId) {
      const resumedAt = new Date().toISOString();

      await mutateTodaySession({
        activeProjectId,
        startedAt: sessionStartedAt ?? resumedAt,
        state: 'running',
        timeBlocks: toSessionTimeBlocks(appendTimeBlock(timeBlocks, activeProjectId, resumedAt)),
      });
      return;
    }

    resumeSession();
  }

  async function handleConfirmActivePulse() {
    if (isAuthenticated && todaySessionId && activePulse) {
      const respondedAt = new Date().toISOString();

      await firePulseMutation.mutateAsync({
        confirmedMinutes: 30,
        firedAt: activePulse.firedAt,
        projectId: activePulse.projectId,
        resolution: 'confirmed',
        respondedAt,
        reviewedAt: respondedAt,
        sessionId: todaySessionId,
        status: 'confirmed',
      });
      return;
    }

    confirmActivePulse();
  }

  async function handleReviewPulse(pulseIndex: number, resolution: 'confirmed' | 'inactive') {
    const pulse = pulseHistory[pulseIndex];

    if (!pulse) {
      return;
    }

    if (isAuthenticated && todaySessionId) {
      const reviewedAt = new Date().toISOString();

      await firePulseMutation.mutateAsync({
        confirmedMinutes: resolution === 'confirmed' ? 30 : 0,
        firedAt: pulse.firedAt,
        projectId: pulse.projectId,
        resolution,
        respondedAt: resolution === 'confirmed' ? pulse.respondedAt ?? reviewedAt : pulse.respondedAt,
        reviewedAt,
        sessionId: todaySessionId,
        status: resolution === 'confirmed' ? 'confirmed' : pulse.status,
      });
      return;
    }

    reviewPulse(pulseIndex, resolution);
  }

  async function handleUpdateTimeBlock(timeBlockIndex: number, updates: Partial<TimeBlock>) {
    if (isAuthenticated && todaySessionId) {
      const nextTimeBlocks = timeBlocks.map((timeBlock, index) => (
        index === timeBlockIndex ? { ...timeBlock, ...updates } : timeBlock
      ));

      await mutateTodaySession({
        timeBlocks: toSessionTimeBlocks(nextTimeBlocks),
      });
      return;
    }

    updateTimeBlock(timeBlockIndex, updates);
  }

  async function handleMoveTaskOnBoard(taskId: string, columnId: string, beforeTaskId?: string) {
    if (isAuthenticated) {
      const task = tasks.find((candidate) => candidate.id === taskId);
      const targetColumn = taskColumns.find((column) => column.id === columnId);

      if (!task || !targetColumn) {
        return;
      }

      await updateTaskStatusMutation.mutateAsync({
        taskId,
        columnId: targetColumn.id,
        cycleAssignment: task.cycleAssignment,
        cycleSessionId: task.cycleAssignment === 'current' ? task.cycleSessionId ?? todaySessionId ?? null : null,
        status: targetColumn.status,
      });
      return;
    }

    moveTaskOnBoard(taskId, columnId, beforeTaskId);
  }

  async function handleSkipTaskToNextCycle(taskId: string, strategy: 'reset-to-backlog' | 'keep-stage' = 'keep-stage') {
    if (isAuthenticated) {
      const task = tasks.find((candidate) => candidate.id === taskId);

      if (!task) {
        return;
      }

      const backlogColumnId = taskColumns.find((column) => column.status === 'todo')?.id ?? task.columnId;

      await updateTaskStatusMutation.mutateAsync({
        taskId,
        columnId: strategy === 'reset-to-backlog' ? backlogColumnId : task.columnId,
        cycleAssignment: 'next',
        cycleSessionId: null,
        status: strategy === 'reset-to-backlog' ? 'todo' : task.status,
      });
      return;
    }

    skipTaskToNextCycle(taskId, strategy);
  }

  async function handleCloseForTodayAtBoundary() {
    if (isAuthenticated && todaySessionId) {
      const boundaryAt = getCycleBoundaryTimestamp(cycleDate);
      const finalizedTimeBlocks = closeOpenTimeBlocks(timeBlocks, boundaryAt);

      await mutateTodaySession({
        closedAt: boundaryAt,
        rollover: {
          carryOverInProgressTaskIds: [],
          strategy: 'manual-start-next',
          triggeredAt: boundaryAt,
        },
        snapshot: buildCycleSnapshot(tasks, finalizedTimeBlocks, totalPlannedHours),
        state: 'completed',
        timeBlocks: toSessionTimeBlocks(finalizedTimeBlocks),
      });
      setIsRolloverPromptOpen(false);
      openDrawer('close');
      return;
    }

    autoCloseCycle(getCycleBoundaryTimestamp(cycleDate), { deferNextCycleUntilManualStart: true });
    setIsRolloverPromptOpen(false);
    openDrawer('close');
  }

  async function handleContinueNextCycle() {
    const nextDate = getLocalISODate(new Date(currentTime.getTime() + 1_000));
    const shouldKeepProject = keepSameProjectOnRollover && Boolean(activeProjectId);

    if (isAuthenticated && todaySessionId) {
      const boundaryAt = getCycleBoundaryTimestamp(cycleDate);
      const finalizedTimeBlocks = closeOpenTimeBlocks(timeBlocks, boundaryAt);
      const carryOverInProgressTaskIds = tasks
        .filter((task) => task.cycleAssignment === 'current' && task.status !== 'done' && !task.isArchived)
        .map((task) => task.id);

      await mutateTodaySession({
        closedAt: boundaryAt,
        rollover: {
          carryOverInProgressTaskIds,
          strategy: 'auto-close-and-open-next',
          triggeredAt: boundaryAt,
        },
        snapshot: buildCycleSnapshot(tasks, finalizedTimeBlocks, totalPlannedHours),
        state: 'completed',
        timeBlocks: toSessionTimeBlocks(finalizedTimeBlocks),
      });

      setSelectedCycleDate(nextDate);

      const nextSession = await queryClient.fetchQuery({
        queryKey: todayKeys.session(nextDate),
        queryFn: () => todayService.getTodaySession(nextDate),
      });

      replaceTodaySession(nextSession);

      if (shouldKeepProject && activeProjectId && nextSession.id) {
        const startedAt = new Date().toISOString();

        await updateTodaySessionMutation.mutateAsync({
          activeProjectId,
          cycleDate: nextDate,
          sessionId: nextSession.id,
          startedAt,
          state: 'running',
          timeBlocks: toSessionTimeBlocks(appendTimeBlock([], activeProjectId, startedAt)),
        });
      }

      setIsRolloverPromptOpen(false);
      return;
    }

    autoCloseCycle(getCycleBoundaryTimestamp(cycleDate));
    startNextCycle({
      continueSession: shouldKeepProject,
      keepActiveProject: shouldKeepProject,
      nextDate,
      startedAt: new Date().toISOString(),
    });
    setIsRolloverPromptOpen(false);
  }

  if (isInitialSyncingToday) {
    return (
      <div className={todayPlannerOverviewStyles.layout}>
        <StateNotice
          description="Carregando sessao, tasks e projetos persistidos para montar o cockpit operacional do dia."
          eyebrow="Hoje"
          title="Sincronizando dados do backend"
        />
      </div>
    );
  }

  if (isAuthenticated && requestErrorMessage && (!todaySessionQuery.data || !projectsQuery.data || !tasksQuery.data)) {
    return (
      <div className={todayPlannerOverviewStyles.layout}>
        <div className={todayPlannerOverviewStyles.noticeStack}>
          <StateNotice
            description={requestErrorMessage}
            eyebrow="Hoje"
            title="Nao foi possivel carregar o cockpit operacional"
            tone="warning"
          />
          <div className={todayPlannerOverviewStyles.noticeActions}>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                void Promise.all([projectsQuery.refetch(), tasksQuery.refetch(), todaySessionQuery.refetch()]);
              }}
            >
              Tentar novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={todayPlannerOverviewStyles.layout}>
      {isRefetchingToday && (
        <StateNotice
          description="Atualizando o estado persistido de Today em segundo plano."
          eyebrow="Hoje"
          title="Sincronizando alteracoes"
        />
      )}

      {requestErrorMessage && !isInitialSyncingToday && (
        <StateNotice
          description={requestErrorMessage}
          eyebrow="Hoje"
          title="Algumas alteracoes nao puderam ser persistidas"
          tone="warning"
        />
      )}

      {rolloverNotice && (
        <div className={todayPlannerOverviewStyles.noticeStack}>
          <StateNotice
            description={rolloverNotice.description}
            eyebrow="Virada do dia"
            title={rolloverNotice.title}
            tone="warning"
          />
          <div className={todayPlannerOverviewStyles.noticeActions}>
            <Button type="button" variant="outline" onClick={() => openDrawer('close')}>
              Revisar fechamento
            </Button>
            <Button type="button" variant="ghost" onClick={clearRolloverNotice}>
              Dispensar por agora
            </Button>
          </div>
        </div>
      )}

      <section className={todayPlannerOverviewStyles.sessionRail}>
        <Card
          className={cn(
            todayPlannerOverviewStyles.sessionBar,
            sessionState === 'idle' && todayPlannerOverviewStyles.sessionBarIdle,
            sessionState === 'running' && todayPlannerOverviewStyles.sessionBarRunning,
            (sessionState === 'paused_manual' || sessionState === 'paused_inactivity') && todayPlannerOverviewStyles.sessionBarPaused,
            sessionState === 'completed' && todayPlannerOverviewStyles.sessionBarCompleted,
          )}
        >
          <CardContent className={todayPlannerOverviewStyles.sessionBarContent}>
            <div className={todayPlannerOverviewStyles.sessionBarHeader}>
              <div>
                <p className={todayPlannerOverviewStyles.sessionEyebrow}>Sessao de trabalho</p>
                <h2 className={todayPlannerOverviewStyles.sessionTitle}>
                  {sessionState === 'idle' && 'Nenhuma sessao iniciada hoje'}
                  {sessionState === 'running' && 'Sessao em andamento'}
                  {sessionState === 'paused_manual' && 'Sessao pausada manualmente'}
                  {sessionState === 'paused_inactivity' && 'Sessao pausada por inatividade'}
                  {sessionState === 'completed' && 'Dia encerrado'}
                </h2>
                <p className={todayPlannerOverviewStyles.sessionCopy}>
                  {sessionState === 'idle' && 'Confirme o plano do dia, selecione o projeto inicial e comece quando estiver pronto.'}
                  {sessionState === 'running' && `Projeto ativo: ${activeProject?.name ?? 'Sem projeto'} · mantenha a cockpit aberta durante o dia.`}
                  {sessionState === 'paused_manual' && 'A sessao esta pausada. Voce pode retomar quando voltar ao foco ou encerrar o dia.'}
                  {sessionState === 'paused_inactivity' && 'O pulso nao foi respondido no tempo esperado. Revise o intervalo ou retome a sessao.'}
                  {sessionState === 'completed' && `${formatHours(daySummaryHours)} registrados · ${completedTasksCount} task(s) concluidas no ciclo atual.`}
                </p>
              </div>

              {sessionState === 'idle' && (
                <div className={todayPlannerOverviewStyles.sessionIdleActions}>
                  <div className={todayPlannerOverviewStyles.projectPickerRoot}>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsProjectPickerOpen((currentValue) => !currentValue)}
                      aria-expanded={isProjectPickerOpen}
                    >
                      {activeProject?.name ?? 'Selecionar projeto inicial'}
                      <ChevronDown className="ml-2 h-4 w-4" aria-hidden="true" />
                    </Button>

                    {isProjectPickerOpen && (
                      <div className={todayPlannerOverviewStyles.projectPickerMenu}>
                        <p className={todayPlannerOverviewStyles.projectPickerLabel}>Projetos no plano de hoje</p>
                        <div className={todayPlannerOverviewStyles.projectPickerList}>
                          {allocations.map((allocation) => (
                            <button
                              key={allocation.projectId}
                              className={cn(
                                todayPlannerOverviewStyles.projectPickerItem,
                                activeProjectId === allocation.projectId && todayPlannerOverviewStyles.projectPickerItemActive,
                              )}
                              type="button"
                              onClick={() => {
                                  void handleSelectProject(allocation.projectId);
                              }}
                            >
                              <span aria-hidden="true" className={todayPlannerOverviewStyles.projectDot} style={{ backgroundColor: allocation.colorHex }} />
                              <span className={todayPlannerOverviewStyles.projectPickerInfo}>
                                <span className={todayPlannerOverviewStyles.projectPickerName}>{allocation.projectName}</span>
                                <span className={todayPlannerOverviewStyles.projectPickerMeta}>
                                  Planejado {formatHours(allocation.plannedHours)} · {allocation.kind === 'fixed' ? 'Fixo' : 'Rotativo'}
                                </span>
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <Button type="button" disabled={!activeProjectId || isMutatingToday} onClick={() => { void handleStartSession(); }}>
                    Iniciar sessao
                  </Button>
                </div>
              )}

              {sessionState !== 'idle' && sessionState !== 'completed' && (
                <div className={todayPlannerOverviewStyles.sessionMetrics}>
                  <div className={todayPlannerOverviewStyles.sessionMetric}>
                    <span className={todayPlannerOverviewStyles.sessionMetricLabel}>Inicio</span>
                    <span className={todayPlannerOverviewStyles.sessionMetricValue}>{formatClock(sessionStartedAt)}</span>
                  </div>
                  <div className={todayPlannerOverviewStyles.sessionMetric}>
                    <span className={todayPlannerOverviewStyles.sessionMetricLabel}>Decorrido</span>
                    <span className={todayPlannerOverviewStyles.sessionMetricValue}>
                      {formatMinutes(sessionStartedAt ? Math.round((currentTime.getTime() - new Date(sessionStartedAt).getTime()) / 60_000) : 0)}
                    </span>
                  </div>
                  <div className={todayPlannerOverviewStyles.sessionMetric}>
                    <span className={todayPlannerOverviewStyles.sessionMetricLabel}>{pulseLabel}</span>
                    <span className={todayPlannerOverviewStyles.sessionMetricValue}>{getCountdownLabel(pulseTargetTimestamp, currentTime)}</span>
                  </div>
                </div>
              )}
            </div>

            {sessionState === 'running' && (
              <div className={todayPlannerOverviewStyles.sessionActions}>
                <Button type="button" variant="outline" onClick={() => { void handlePauseSession(); }}>
                  Pausar
                </Button>
                <Button type="button" onClick={() => openDrawer('close')}>
                  Encerrar dia
                </Button>
              </div>
            )}

            {sessionState === 'paused_manual' && (
              <div className={todayPlannerOverviewStyles.sessionActions}>
                <Button type="button" variant="outline" onClick={() => { void handleResumeSession(); }}>
                  Retomar
                </Button>
                <Button type="button" onClick={() => openDrawer('close')}>
                  Encerrar dia
                </Button>
              </div>
            )}

            {sessionState === 'paused_inactivity' && (
              <div className={todayPlannerOverviewStyles.sessionActions}>
                <Button type="button" variant="outline" onClick={() => { void handleResumeSession(); }}>
                  Retomar sessao
                </Button>
                <Button type="button" variant="outline" onClick={() => openDrawer('review')}>
                  Revisar tempo
                </Button>
                <Button type="button" onClick={() => openDrawer('close')}>
                  Encerrar dia
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {activePulse && (
          <Card className={todayPlannerOverviewStyles.pulseBanner}>
            <CardContent className={todayPlannerOverviewStyles.pulseBannerContent}>
              <div>
                <p className={todayPlannerOverviewStyles.pulseBannerEyebrow}>Pulso de atividade</p>
                <h3 className={todayPlannerOverviewStyles.pulseBannerTitle}>Ainda trabalhando? Confirmar atividade</h3>
                <p className={todayPlannerOverviewStyles.pulseBannerCopy}>
                  O pulso atual vence em {getCountdownLabel(activePulse.expiresAt, currentTime)}.
                </p>
              </div>
              <Button type="button" onClick={() => { void handleConfirmActivePulse(); }}>
                Confirmar atividade
              </Button>
            </CardContent>
          </Card>
        )}
      </section>

      {allocations.length === 0 ? (
        <EmptyState
          eyebrow="Hoje"
          title="Nao ha frentes suficientes para montar o plano do dia"
          description="Ative projetos para liberar a sessao operacional e permitir a selecao de um projeto inicial."
          hint="O cockpit precisa de pelo menos um projeto ativo para iniciar a sessao."
        />
      ) : (
        <>
          {isPlanExpanded ? (
            <Card>
              <CardHeader className={todayPlannerOverviewStyles.cardHeaderInline}>
                <div>
                  <CardDescription>Plano do dia</CardDescription>
                  <CardTitle>Horas disponiveis e distribuicao recomendada</CardTitle>
                </div>
                {sessionState !== 'idle' && (
                  <Button type="button" variant="ghost" onClick={() => setIsPlanExpanded(false)}>
                    Recolher plano
                    <ChevronUp className="ml-2 h-4 w-4" aria-hidden="true" />
                  </Button>
                )}
              </CardHeader>
              <CardContent className={todayPlannerOverviewStyles.planCardContent}>
                <TodayCycleForm defaultValues={cycleValues} onSubmitCycle={handleSubmitCycle} />
                <div className={todayPlannerOverviewStyles.planList}>
                  {allocations.map((allocation) => (
                    <div key={allocation.projectId} className={todayPlannerOverviewStyles.planItem}>
                      <div className={todayPlannerOverviewStyles.planItemMeta}>
                        <span aria-hidden="true" className={todayPlannerOverviewStyles.projectDot} style={{ backgroundColor: allocation.colorHex }} />
                        <div>
                          <p className={todayPlannerOverviewStyles.planItemTitle}>{allocation.projectName}</p>
                          <p className={todayPlannerOverviewStyles.planItemCopy}>{allocation.reason}</p>
                        </div>
                      </div>
                      <span className={todayPlannerOverviewStyles.planItemHours}>{formatHours(allocation.plannedHours)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className={todayPlannerOverviewStyles.collapsedPlanContent}>
                <div>
                  <p className={todayPlannerOverviewStyles.collapsedPlanEyebrow}>Plano do dia</p>
                  <h3 className={todayPlannerOverviewStyles.collapsedPlanTitle}>{formatHours(totalPlannedHours)} distribuidas em {allocations.length} projeto(s)</h3>
                </div>
                <Button type="button" variant="outline" onClick={() => setIsPlanExpanded(true)}>
                  Rever plano
                  <ChevronDown className="ml-2 h-4 w-4" aria-hidden="true" />
                </Button>
              </CardContent>
            </Card>
          )}

          {sessionState !== 'idle' && activeProject && (
            <Card>
              <CardHeader className={todayPlannerOverviewStyles.cardHeaderInline}>
                <div>
                  <CardDescription>Projeto ativo</CardDescription>
                  <CardTitle>Foco operacional do momento</CardTitle>
                </div>
                <div className={todayPlannerOverviewStyles.projectPickerRoot}>
                  <Button type="button" variant="outline" onClick={() => setIsProjectPickerOpen((currentValue) => !currentValue)}>
                    Trocar projeto
                    <ChevronDown className="ml-2 h-4 w-4" aria-hidden="true" />
                  </Button>

                  {isProjectPickerOpen && (
                    <div className={todayPlannerOverviewStyles.projectPickerMenu}>
                      <p className={todayPlannerOverviewStyles.projectPickerLabel}>Projetos no plano de hoje</p>
                      <div className={todayPlannerOverviewStyles.projectPickerList}>
                        {allocations.map((allocation) => (
                          <button
                            key={allocation.projectId}
                            className={cn(
                              todayPlannerOverviewStyles.projectPickerItem,
                              activeProjectId === allocation.projectId && todayPlannerOverviewStyles.projectPickerItemActive,
                            )}
                            type="button"
                            onClick={() => {
                              void handleSelectProject(allocation.projectId);
                            }}
                          >
                            <span aria-hidden="true" className={todayPlannerOverviewStyles.projectDot} style={{ backgroundColor: allocation.colorHex }} />
                            <span className={todayPlannerOverviewStyles.projectPickerInfo}>
                              <span className={todayPlannerOverviewStyles.projectPickerName}>{allocation.projectName}</span>
                              <span className={todayPlannerOverviewStyles.projectPickerMeta}>
                                Planejado {formatHours(allocation.plannedHours)} · Real {formatHours(trackedHoursByProject[allocation.projectId] ?? 0)}
                              </span>
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className={todayPlannerOverviewStyles.activeProjectCard}>
                <div className={todayPlannerOverviewStyles.activeProjectIdentity}>
                  <span aria-hidden="true" className={todayPlannerOverviewStyles.activeProjectDot} style={{ backgroundColor: activeProject.colorHex }} />
                  <div>
                    <p className={todayPlannerOverviewStyles.activeProjectLabel}>Projeto ativo agora</p>
                    <p className={todayPlannerOverviewStyles.activeProjectName}>{activeProject.name}</p>
                  </div>
                </div>
                <p className={todayPlannerOverviewStyles.activeProjectCopy}>
                  Planejado {formatHours(activeProjectPlannedHours)} · Real {formatHours(activeProjectTrackedHours)}
                </p>
              </CardContent>
            </Card>
          )}

          {activeProject && sessionState !== 'idle' && sessionState !== 'completed' && (
            <Card>
              <CardHeader className={todayPlannerOverviewStyles.cardHeaderInline}>
                <div>
                  <CardDescription>Tasks do projeto ativo</CardDescription>
                  <CardTitle>Board operacional de hoje</CardTitle>
                </div>
                <p className={todayPlannerOverviewStyles.activeProjectCopy}>
                  Somente tasks do projeto ativo e do cycle atual aparecem aqui.
                </p>
              </CardHeader>
              <CycleTasksBoard
                activeProject={activeProject}
                onMoveTaskOnBoard={(taskId, columnId, beforeTaskId) => {
                  void handleMoveTaskOnBoard(taskId, columnId, beforeTaskId);
                }}
                onOpenTask={setTaskDrawerTaskId}
                onSkipTask={(taskId, strategy) => {
                  void handleSkipTaskToNextCycle(taskId, strategy);
                }}
                taskColumns={taskColumns}
                tasks={tasks}
              />
            </Card>
          )}

          {sessionState !== 'idle' && (
            <section className={todayPlannerOverviewStyles.progressGrid} aria-label="Resumo do progresso do dia">
              <Card>
                <CardHeader className={todayPlannerOverviewStyles.progressCardHeader}>
                  <CardDescription>Progresso do dia</CardDescription>
                  <CardTitle>{formatHours(totalTrackedHours)} / {formatHours(totalPlannedHours)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={todayPlannerOverviewStyles.progressBarTrack}>
                    <div className={todayPlannerOverviewStyles.progressBarFill} style={{ width: `${Math.min((totalTrackedHours / Math.max(totalPlannedHours, 1)) * 100, 100)}%` }} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className={todayPlannerOverviewStyles.progressCardHeader}>
                  <CardDescription>Projeto ativo</CardDescription>
                  <CardTitle>{formatHours(activeProjectTrackedHours)} / {formatHours(activeProjectPlannedHours)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={todayPlannerOverviewStyles.progressBarTrack}>
                    <div className={todayPlannerOverviewStyles.progressBarFillProject} style={{ width: `${Math.min((activeProjectTrackedHours / Math.max(activeProjectPlannedHours, 1)) * 100, 100)}%` }} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className={todayPlannerOverviewStyles.progressCardHeader}>
                  <CardDescription>Ritmo</CardDescription>
                  <CardTitle
                    className={cn(
                      rhythmStatus.tone === 'positive' && todayPlannerOverviewStyles.positiveText,
                      rhythmStatus.tone === 'warning' && todayPlannerOverviewStyles.warningText,
                      rhythmStatus.tone === 'danger' && todayPlannerOverviewStyles.dangerText,
                    )}
                  >
                    {rhythmStatus.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={todayPlannerOverviewStyles.progressMetaList}>
                    <span>Saldo do dia: {formatHours(Math.max(totalPlannedHours - totalTrackedHours, 0))}</span>
                    <span>Confirmado: {formatHours(totalConfirmedHours)}</span>
                  </div>
                </CardContent>
              </Card>
            </section>
          )}
        </>
      )}

      <OverlayPanel
        description="Faltam poucos minutos para a virada. Decida se este dia deve ser fechado agora ou se voce quer entrar no proximo ciclo mantendo a continuidade do trabalho."
        isOpen={isRolloverPromptOpen}
        onClose={() => setIsRolloverPromptOpen(false)}
        title="Virada do dia em andamento"
      >
        <div className={todayPlannerOverviewStyles.drawerStack}>
          <section className={todayPlannerOverviewStyles.drawerSection}>
            <div className={todayPlannerOverviewStyles.drawerSectionHeader}>
              <h3 className={todayPlannerOverviewStyles.drawerSectionTitle}>O que fica carregado para a virada</h3>
              <p className={todayPlannerOverviewStyles.drawerSectionCopy}>Confira o estado atual antes de decidir entre fechar este dia ou seguir direto para o novo ciclo.</p>
            </div>
            <div className={todayPlannerOverviewStyles.drawerSummaryRollover}>
              <div className={todayPlannerOverviewStyles.drawerSummaryItem}>
                <span>Horas registradas hoje</span>
                <strong>{formatHours(totalTrackedHours)}</strong>
              </div>
              <div className={todayPlannerOverviewStyles.drawerSummaryItem}>
                <span>Projeto ativo</span>
                <strong>{activeProject?.name ?? 'Sem projeto ativo'}</strong>
              </div>
              <div className={todayPlannerOverviewStyles.drawerSummaryItem}>
                <span>Tasks em andamento</span>
                <strong>{tasks.filter((task) => task.cycleAssignment === 'current' && task.status !== 'done' && !task.isArchived).length}</strong>
              </div>
            </div>
            <label className={todayPlannerOverviewStyles.rolloverToggle}>
              <input
                checked={keepSameProjectOnRollover}
                onChange={(event) => setKeepSameProjectOnRollover(event.target.checked)}
                type="checkbox"
              />
              <span>Entrar no novo ciclo com o mesmo projeto ja ativo</span>
            </label>
          </section>

          <div className={todayPlannerOverviewStyles.drawerFooter}>
            <Button type="button" variant="outline" onClick={() => { void handleCloseForTodayAtBoundary(); }}>
              Fechar este dia
            </Button>
            <Button type="button" onClick={() => { void handleContinueNextCycle(); }}>
              Seguir para o novo dia
            </Button>
          </div>
        </div>
      </OverlayPanel>

      <OverlayPanel
        description={taskDrawerTask ? 'Abra a task no drawer para revisar descricao, checklist e atualizar o andamento sem sair do Hoje.' : undefined}
        isOpen={Boolean(taskDrawerTask)}
        onClose={() => setTaskDrawerTaskId(null)}
        title={taskDrawerTask ? taskDrawerTask.title : 'Task'}
      >
        {taskDrawerTask ? (
          <TaskForm
            autosave
            columns={taskColumns}
            defaultValues={taskDrawerTask}
            onCancelEdit={() => setTaskDrawerTaskId(null)}
            onSubmitTask={(values) => {
              void handleSubmitTaskUpdate(values);
            }}
            projects={projects}
          />
        ) : null}
      </OverlayPanel>

      <OverlayPanel
        isOpen={drawerMode !== null}
        onClose={handleCloseDrawer}
        title={drawerMode === 'review' ? 'Revisar tempo' : 'Encerrar dia'}
        description={drawerMode === 'review'
          ? 'Regularize pulsos sem resposta e ajuste os blocos de tempo antes de retomar ou fechar o ciclo.'
          : 'Revise os blocos do dia, ajuste as horas finais e confirme o encerramento do ciclo.'}
      >
        <div className={todayPlannerOverviewStyles.drawerStack}>
          {resolvedCloseDayReview.requiresConfirmation && (
            <div className={todayPlannerOverviewStyles.reviewNotice}>
              <AlertTriangle className="h-4.5 w-4.5" aria-hidden="true" />
              <p>{resolvedCloseDayReview.message}</p>
            </div>
          )}

          <section className={todayPlannerOverviewStyles.drawerSection}>
            <div className={todayPlannerOverviewStyles.drawerSectionHeader}>
              <h3 className={todayPlannerOverviewStyles.drawerSectionTitle}>Linha do tempo de pulsos</h3>
              <p className={todayPlannerOverviewStyles.drawerSectionCopy}>Confirme ou marque como inativo qualquer intervalo ainda pendente.</p>
            </div>
            <div className={todayPlannerOverviewStyles.drawerList}>
              {pulseHistory.length === 0 ? (
                <p className={todayPlannerOverviewStyles.drawerEmptyCopy}>Nenhum pulso registrado ainda nesta sessao.</p>
              ) : (
                pulseHistory.map((pulse, index) => (
                  <div
                    key={`${pulse.firedAt}-${index}`}
                    className={cn(
                      todayPlannerOverviewStyles.pulseItem,
                      regularizationState.highlightedPulseIndex === index && todayPlannerOverviewStyles.pulseItemHighlighted,
                    )}
                  >
                    <div>
                      <p className={todayPlannerOverviewStyles.pulseItemTitle}>{formatClock(pulse.firedAt)} · {pulse.projectId ? allocationMap.get(pulse.projectId)?.projectName ?? pulse.projectId : 'Sem projeto'}</p>
                      <p className={todayPlannerOverviewStyles.pulseItemCopy}>
                        {pulse.status === 'confirmed' ? 'Pulso confirmado.' : pulse.resolution === 'inactive' ? 'Intervalo marcado como inativo.' : 'Intervalo ainda sem revisao.'}
                      </p>
                    </div>
                    {pulse.resolution === 'pending' ? (
                      <div className={todayPlannerOverviewStyles.pulseActions}>
                        <Button type="button" size="sm" variant="outline" onClick={() => { void handleReviewPulse(index, 'inactive'); }}>
                          Marcar inativa
                        </Button>
                        <Button type="button" size="sm" onClick={() => { void handleReviewPulse(index, 'confirmed'); }}>
                          Confirmar janela
                        </Button>
                      </div>
                    ) : (
                      <span className={todayPlannerOverviewStyles.pulseResolutionBadge}>
                        {pulse.resolution === 'confirmed' ? 'Confirmado' : 'Inativo'}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>

          <section className={todayPlannerOverviewStyles.drawerSection}>
            <div className={todayPlannerOverviewStyles.drawerSectionHeader}>
              <h3 className={todayPlannerOverviewStyles.drawerSectionTitle}>Blocos de tempo</h3>
              <p className={todayPlannerOverviewStyles.drawerSectionCopy}>Revise projeto, duracao total e minutos confiaveis registrados em cada bloco.</p>
            </div>
            <div className={todayPlannerOverviewStyles.drawerList}>
              {timeBlocks.map((timeBlock, index) => {
                const trackedMinutes = getTimeBlockDurationInMinutes(timeBlock, currentTime.toISOString());
                const unconfirmedMinutes = Math.max(0, trackedMinutes - timeBlock.confirmedMinutes);

                return (
                  <div key={`${timeBlock.projectId}-${timeBlock.startedAt}-${index}`} className={todayPlannerOverviewStyles.timeBlockItem}>
                    <div className={todayPlannerOverviewStyles.timeBlockTop}>
                      <select
                        aria-label={`Projeto do bloco ${index + 1}`}
                        className={todayPlannerOverviewStyles.timeBlockSelect}
                        value={timeBlock.projectId}
                        onChange={(event) => {
                          void handleUpdateTimeBlock(index, { projectId: event.target.value });
                        }}
                      >
                        {allocations.map((allocation) => (
                          <option key={allocation.projectId} value={allocation.projectId}>{allocation.projectName}</option>
                        ))}
                      </select>
                      <span className={todayPlannerOverviewStyles.timeBlockWindow}>{formatClock(timeBlock.startedAt)} - {formatClock(timeBlock.endedAt ?? currentTime.toISOString())}</span>
                    </div>
                    <div className={todayPlannerOverviewStyles.timeBlockMetrics}>
                      <span>Total {formatMinutes(trackedMinutes)}</span>
                      <span>Confirmado {formatMinutes(timeBlock.confirmedMinutes)}</span>
                      <span>Nao confirmado {formatMinutes(unconfirmedMinutes)}</span>
                    </div>
                    <div className={todayPlannerOverviewStyles.timeBlockActions}>
                      <Button type="button" size="sm" variant="outline" onClick={() => { void handleUpdateTimeBlock(index, { confirmedMinutes: Math.max(0, timeBlock.confirmedMinutes - 15) }); }}>
                        -15min
                      </Button>
                      <Button type="button" size="sm" variant="outline" onClick={() => { void handleUpdateTimeBlock(index, { confirmedMinutes: Math.min(trackedMinutes, timeBlock.confirmedMinutes + 15) }); }}>
                        +15min
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className={todayPlannerOverviewStyles.drawerSection}>
            <div className={todayPlannerOverviewStyles.drawerSectionHeader}>
              <h3 className={todayPlannerOverviewStyles.drawerSectionTitle}>Fechamento com horas finais</h3>
              <p className={todayPlannerOverviewStyles.drawerSectionCopy}>Use os ajustes finais para consolidar o que sera salvo no resumo do dia.</p>
            </div>
            <div className={todayPlannerOverviewStyles.drawerList}>
              {allocations.map((allocation) => (
                <div key={allocation.projectId} className={todayPlannerOverviewStyles.finalHoursItem}>
                  <div>
                    <p className={todayPlannerOverviewStyles.finalHoursTitle}>{allocation.projectName}</p>
                    <p className={todayPlannerOverviewStyles.finalHoursCopy}>Planejado {formatHours(allocation.plannedHours)} · Real atual {formatHours(trackedHoursByProject[allocation.projectId] ?? 0)}</p>
                  </div>
                  <div className={todayPlannerOverviewStyles.finalHoursActions}>
                    <Button type="button" size="sm" variant="outline" onClick={() => handleAdjustDraftHours(allocation.projectId, -0.5)}>
                      -0.5h
                    </Button>
                    <span className={todayPlannerOverviewStyles.finalHoursValue}>{formatHours(draftActualHours[allocation.projectId] ?? trackedHoursByProject[allocation.projectId] ?? 0)}</span>
                    <Button type="button" size="sm" variant="outline" onClick={() => handleAdjustDraftHours(allocation.projectId, 0.5)}>
                      +0.5h
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {drawerMode === 'close' && (
            <div className={todayPlannerOverviewStyles.drawerFooter}>
              <div className={todayPlannerOverviewStyles.drawerSummary}>
                <div className={todayPlannerOverviewStyles.drawerSummaryItem}>
                  <span>Horas registradas</span>
                  <strong>{formatHours(Number(Object.values(draftActualHours).reduce((total, value) => total + value, 0).toFixed(1)))}</strong>
                </div>
                <div className={todayPlannerOverviewStyles.drawerSummaryItem}>
                  <span>Tasks concluidas</span>
                  <strong>{completedTasksCount}</strong>
                </div>
              </div>
              <Button type="button" onClick={() => { void handleConfirmCloseDay(); }}>
                Confirmar encerramento
              </Button>
            </div>
          )}
        </div>
      </OverlayPanel>
    </div>
  );
}