import { NotFoundException } from '@nestjs/common';

import { buildCloseDayReview, buildRegularizationState, DEFAULT_PULSE_RESPONSE_WINDOW_MINUTES } from '@/modules/cycle/utils/pulse';
import { addMinutesToTimestamp, applyConfirmedMinutesToTimeBlocks } from '@/modules/cycle/utils/pulse';
import { buildOperationalBoundary } from '@/modules/cycle/utils/operational-boundary';

import type { UserSettingsDTO } from '@/modules/settings/types/settings';
import type { CycleSession, CycleTimeBlock, PulseRecord, Task } from '@/shared/database/schema';
import type { TodayActivePulseDTO, TodayCycleSnapshotDTO, TodayPulseRecordDTO, TodaySessionDTO, TodayTimeBlockDTO } from '@/modules/cycle/types/today';

export function toTodayTimeBlockDTO(block: CycleTimeBlock): TodayTimeBlockDTO {
  return {
    confirmedMinutes: block.confirmedMinutes,
    endedAt: block.endedAt?.toISOString() ?? null,
    id: block.id,
    projectId: block.projectId,
    startedAt: block.startedAt.toISOString(),
  };
}

export function toTodayPulseRecordDTO(record: PulseRecord): TodayPulseRecordDTO {
  return {
    confirmedMinutes: record.confirmedMinutes,
    firedAt: record.firedAt.toISOString(),
    projectId: record.projectId,
    resolution: record.resolution,
    respondedAt: record.respondedAt?.toISOString() ?? null,
    reviewedAt: record.reviewedAt?.toISOString() ?? null,
    status: record.status,
  };
}

export function deriveActivePulse(pulseHistory: TodayPulseRecordDTO[], referenceAt: string): TodayActivePulseDTO | null {
  const activePulse = pulseHistory.findLast((pulse) => pulse.respondedAt === null && pulse.resolution === 'pending');

  if (!activePulse) {
    return null;
  }

  const expiresAt = addMinutesToTimestamp(activePulse.firedAt, DEFAULT_PULSE_RESPONSE_WINDOW_MINUTES);

  if (new Date(expiresAt).getTime() <= new Date(referenceAt).getTime()) {
    return null;
  }

  return {
    expiresAt,
    firedAt: activePulse.firedAt,
    projectId: activePulse.projectId,
  };
}

export function syncConfirmedMinutes(timeBlocks: TodayTimeBlockDTO[], pulseHistory: TodayPulseRecordDTO[]) {
  return pulseHistory.reduce((accumulator, pulse) => {
    if (pulse.resolution !== 'confirmed' || pulse.confirmedMinutes <= 0) {
      return accumulator;
    }

    return applyConfirmedMinutesToTimeBlocks(accumulator, pulse.firedAt, pulse.confirmedMinutes, pulse.respondedAt ?? undefined);
  }, timeBlocks.map((timeBlock) => ({ ...timeBlock, confirmedMinutes: 0 })));
}

export function buildSnapshotFromSession(tasks: Task[], timeBlocks: TodayTimeBlockDTO[], persistedSnapshot: CycleSession['snapshot']): TodayCycleSnapshotDTO | null {
  if (persistedSnapshot) {
    return persistedSnapshot;
  }

  const currentCycleTasks = tasks.filter((task) => task.cycleAssignment === 'current');

  if (currentCycleTasks.length === 0 && timeBlocks.length === 0) {
    return null;
  }

  const actualHours = Math.round((timeBlocks.reduce((total, block) => total + block.confirmedMinutes, 0) / 60) * 10) / 10;

  return {
    actualHours,
    completedTaskIds: currentCycleTasks.filter((task) => task.status === 'done').map((task) => task.id),
    incompleteTaskIds: currentCycleTasks.filter((task) => task.status !== 'done').map((task) => task.id),
    plannedHours: persistedSnapshot?.plannedHours ?? 0,
  };
}

export function buildTodaySessionDTO(params: {
  pulseRows: PulseRecord[];
  session: CycleSession | null;
  settings: UserSettingsDTO;
  taskRows: Task[];
  timeBlockRows: CycleTimeBlock[];
  referenceAt?: string;
}): TodaySessionDTO {
  const referenceAt = params.referenceAt ?? new Date().toISOString();

  if (!params.session) {
    throw new NotFoundException('Cycle session was not found.');
  }

  const pulseHistory = params.pulseRows.map(toTodayPulseRecordDTO);
  const timeBlocks = syncConfirmedMinutes(params.timeBlockRows.map(toTodayTimeBlockDTO), pulseHistory);
  const activePulse = deriveActivePulse(pulseHistory, referenceAt);

  return {
    activeProjectId: params.session.activeProjectId,
    closeDayReview: {
      ...buildCloseDayReview(pulseHistory),
      closedAt: params.session.closedAt?.toISOString() ?? null,
    },
    closedAt: params.session.closedAt?.toISOString() ?? null,
    cycleDate: params.session.cycleDate,
    id: params.session.id,
    operationalBoundary: buildOperationalBoundary(params.session.cycleDate, {
      cycleStartHour: params.settings.cycleStartHour,
      timezone: params.settings.timezone,
    }),
    pulses: {
      active: activePulse,
      history: pulseHistory,
    },
    regularization: buildRegularizationState(pulseHistory),
    rollover: {
      carryOverInProgressTaskIds: params.taskRows
        .filter((task) => task.cycleAssignment === 'next')
        .map((task) => task.id),
      noticeDescription: params.session.rolloverNoticeDescription,
      noticeTitle: params.session.rolloverNoticeTitle,
      previousCycleDate: params.session.previousCycleDate,
      strategy: params.session.rolloverStrategy,
      triggeredAt: params.session.rolloverTriggeredAt?.toISOString() ?? null,
    },
    snapshot: buildSnapshotFromSession(params.taskRows, timeBlocks, params.session.snapshot),
    startedAt: params.session.startedAt?.toISOString() ?? null,
    state: params.session.state,
    taskScope: {
      completedTaskIds: params.taskRows.filter((task) => task.cycleSessionId === params.session!.id && task.status === 'done' && task.cycleAssignment === 'current').map((task) => task.id),
      currentTaskIds: params.taskRows.filter((task) => task.cycleSessionId === params.session!.id && task.cycleAssignment === 'current' && task.status !== 'done').map((task) => task.id),
      linkedCycleSessionId: params.session.id,
      nextCycleTaskIds: params.taskRows.filter((task) => task.cycleAssignment === 'next').map((task) => task.id),
      relationMode: 'cycle-session-and-assignment',
    },
    timeBlocks,
  };
}