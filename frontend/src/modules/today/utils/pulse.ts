import type { CloseDayReview, PulseRecord, TimeBlock } from '@/modules/today/types';

export const DEFAULT_PULSE_INTERVAL_MINUTES = 30;
export const DEFAULT_PULSE_RESPONSE_WINDOW_MINUTES = 5;
export const SIGNIFICANT_UNCONFIRMED_MINUTES = 15;

export function addMinutesToTimestamp(timestamp: string, minutes: number): string {
  return new Date(new Date(timestamp).getTime() + minutes * 60_000).toISOString();
}

export function getMillisecondsUntil(timestamp: string): number {
  return Math.max(0, new Date(timestamp).getTime() - Date.now());
}

export function getTimeBlockDurationInMinutes(timeBlock: TimeBlock, referenceTimestamp?: string): number {
  const endTimestamp = timeBlock.endedAt ?? referenceTimestamp;

  if (!endTimestamp) {
    return 0;
  }

  return Math.max(0, Math.round((new Date(endTimestamp).getTime() - new Date(timeBlock.startedAt).getTime()) / 60_000));
}

export function findTimeBlockIndexForTimestamp(timeBlocks: TimeBlock[], timestamp: string): number {
  const targetTime = new Date(timestamp).getTime();

  return timeBlocks.findIndex((timeBlock) => {
    const startedAt = new Date(timeBlock.startedAt).getTime();
    const endedAt = new Date(timeBlock.endedAt ?? timestamp).getTime();

    return targetTime >= startedAt && targetTime <= endedAt;
  });
}

export function applyConfirmedMinutesToTimeBlocks(
  timeBlocks: TimeBlock[],
  pulseTimestamp: string,
  confirmedMinutes: number,
  referenceTimestamp?: string,
): TimeBlock[] {
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

export function getPendingUnconfirmedMinutes(pulseHistory: PulseRecord[]): number {
  return pulseHistory.reduce((total, pulse) => {
    if (pulse.status !== 'unconfirmed' || pulse.resolution !== 'pending') {
      return total;
    }

    return total + DEFAULT_PULSE_INTERVAL_MINUTES;
  }, 0);
}

export function buildCloseDayReview(pulseHistory: PulseRecord[]): CloseDayReview {
  const unconfirmedMinutes = getPendingUnconfirmedMinutes(pulseHistory);
  const requiresConfirmation = unconfirmedMinutes > SIGNIFICANT_UNCONFIRMED_MINUTES;

  return {
    requiresConfirmation,
    unconfirmedMinutes,
    message: requiresConfirmation
      ? `Encontramos ${unconfirmedMinutes} min sem confirmacao. Fechar considerando apenas o tempo confirmado?`
      : null,
  };
}