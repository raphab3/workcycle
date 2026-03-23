import { addMinutesToTimestamp, DEFAULT_PULSE_INTERVAL_MINUTES } from '@/modules/today/utils/pulse';

import type { ActivePulse, CycleState, PulseRecord, TimeBlock, TodaySessionDTO } from '@/modules/today/types';

function buildActualHoursFromTimeBlocks(timeBlocks: TimeBlock[]) {
  return timeBlocks.reduce<Record<string, number>>((hoursByProject, timeBlock) => ({
    ...hoursByProject,
    [timeBlock.projectId]: Number((((hoursByProject[timeBlock.projectId] ?? 0) * 60 + timeBlock.confirmedMinutes) / 60).toFixed(1)),
  }), {});
}

function deriveNextPulseDueAt(pulseHistory: PulseRecord[], activePulse: ActivePulse | null, session: TodaySessionDTO) {
  if (session.state !== 'running' || activePulse) {
    return null;
  }

  const lastPulse = pulseHistory[pulseHistory.length - 1];

  if (!lastPulse) {
    return session.startedAt ? addMinutesToTimestamp(session.startedAt, DEFAULT_PULSE_INTERVAL_MINUTES) : null;
  }

  if (lastPulse.status === 'confirmed' && lastPulse.respondedAt) {
    return addMinutesToTimestamp(lastPulse.respondedAt, DEFAULT_PULSE_INTERVAL_MINUTES);
  }

  return null;
}

function deriveCycleState(session: TodaySessionDTO): CycleState {
  if (session.state === 'completed' && session.rollover.triggeredAt) {
    return 'AUTO_CLOSED';
  }

  if (session.state === 'completed') {
    return 'CLOSED';
  }

  if (session.state === 'running' || session.state === 'paused_manual' || session.state === 'paused_inactivity') {
    return 'ACTIVE';
  }

  return 'PLANNED';
}

export function mapTodaySessionToWorkspace(session: TodaySessionDTO) {
  return {
    activeProjectId: session.activeProjectId,
    activePulse: session.pulses.active,
    closeDayReview: {
      message: session.closeDayReview.message,
      requiresConfirmation: session.closeDayReview.requiresConfirmation,
      unconfirmedMinutes: session.closeDayReview.unconfirmedMinutes,
    },
    cycleDate: session.cycleDate,
    cycleSnapshot: session.snapshot,
    cycleState: deriveCycleState(session),
    nextPulseDueAt: deriveNextPulseDueAt(session.pulses.history, session.pulses.active, session),
    pulseHistory: session.pulses.history,
    regularizationState: {
      highlightedPulseIndex: session.regularization.highlightedPulseIndex,
      isOpen: session.regularization.isOpen,
    },
    rolloverNotice: session.rollover.noticeTitle && session.rollover.noticeDescription
      ? {
        description: session.rollover.noticeDescription,
        previousCycleDate: session.rollover.previousCycleDate ?? session.cycleDate,
        title: session.rollover.noticeTitle,
      }
      : null,
    sessionStartedAt: session.startedAt,
    sessionState: session.state,
    timeBlocks: session.timeBlocks,
    todayActualHours: buildActualHoursFromTimeBlocks(session.timeBlocks),
    todaySessionId: session.id,
  };
}