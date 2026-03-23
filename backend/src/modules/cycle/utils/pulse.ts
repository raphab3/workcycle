import type { TodayPulseRecordDTO, TodayRegularizationDTO, TodayRegularizationEntryDTO, TodayTimeBlockDTO } from '@/modules/cycle/types/today';

export const DEFAULT_PULSE_INTERVAL_MINUTES = 30;
export const DEFAULT_PULSE_RESPONSE_WINDOW_MINUTES = 5;
export const SIGNIFICANT_UNCONFIRMED_MINUTES = 15;

export function addMinutesToTimestamp(timestamp: string, minutes: number) {
  return new Date(new Date(timestamp).getTime() + minutes * 60_000).toISOString();
}

export function getTimeBlockDurationInMinutes(timeBlock: TodayTimeBlockDTO, referenceTimestamp?: string) {
  const endTimestamp = timeBlock.endedAt ?? referenceTimestamp;

  if (!endTimestamp) {
    return 0;
  }

  return Math.max(0, Math.round((new Date(endTimestamp).getTime() - new Date(timeBlock.startedAt).getTime()) / 60_000));
}

export function findTimeBlockIndexForTimestamp(timeBlocks: TodayTimeBlockDTO[], timestamp: string) {
  const targetTime = new Date(timestamp).getTime();

  return timeBlocks.findIndex((timeBlock) => {
    const startedAt = new Date(timeBlock.startedAt).getTime();
    const endedAt = new Date(timeBlock.endedAt ?? timestamp).getTime();

    return targetTime >= startedAt && targetTime <= endedAt;
  });
}

export function applyConfirmedMinutesToTimeBlocks(
  timeBlocks: TodayTimeBlockDTO[],
  pulseTimestamp: string,
  confirmedMinutes: number,
  referenceTimestamp?: string,
) {
  const timeBlockIndex = findTimeBlockIndexForTimestamp(timeBlocks, pulseTimestamp);

  if (timeBlockIndex === -1) {
    return timeBlocks;
  }

  return timeBlocks.map((timeBlock, index) => {
    if (index !== timeBlockIndex) {
      return timeBlock;
    }

    const maxConfirmableMinutes = getTimeBlockDurationInMinutes(timeBlock, referenceTimestamp);

    return {
      ...timeBlock,
      confirmedMinutes: Math.min(maxConfirmableMinutes, timeBlock.confirmedMinutes + confirmedMinutes),
    };
  });
}

export function getPendingUnconfirmedMinutes(pulseHistory: TodayPulseRecordDTO[]) {
  return pulseHistory.reduce((total, pulse) => {
    if (pulse.status !== 'unconfirmed' || pulse.resolution !== 'pending') {
      return total;
    }

    return total + DEFAULT_PULSE_INTERVAL_MINUTES;
  }, 0);
}

export function buildCloseDayReview(pulseHistory: TodayPulseRecordDTO[]) {
  const unconfirmedMinutes = getPendingUnconfirmedMinutes(pulseHistory);
  const requiresConfirmation = unconfirmedMinutes > SIGNIFICANT_UNCONFIRMED_MINUTES;

  return {
    closedAt: null,
    requiresConfirmation,
    unconfirmedMinutes,
    message: requiresConfirmation
      ? `Encontramos ${unconfirmedMinutes} min sem confirmacao. Fechar considerando apenas o tempo confirmado?`
      : null,
  };
}

export function buildRegularizationState(pulseHistory: TodayPulseRecordDTO[]): TodayRegularizationDTO {
  const history: TodayRegularizationEntryDTO[] = pulseHistory
    .filter((pulse) => pulse.status === 'unconfirmed' && pulse.reviewedAt !== null)
    .map((pulse) => ({
      confirmedMinutes: pulse.confirmedMinutes,
      nextResolution: pulse.resolution === 'inactive' ? 'inactive' : 'confirmed',
      previousResolution: 'pending' as const,
      pulseFiredAt: pulse.firedAt,
      reason: null,
      reviewedAt: pulse.reviewedAt!,
    }));
  const pendingPulseIndices = pulseHistory
    .map((pulse, index) => ({ index, pulse }))
    .filter(({ pulse }) => pulse.status === 'unconfirmed' && pulse.resolution === 'pending');

  return {
    highlightedPulseIndex: pendingPulseIndices.at(-1)?.index ?? null,
    history,
    isOpen: false,
    pendingPulseCount: pendingPulseIndices.length,
  };
}