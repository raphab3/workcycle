import type { PulseRecord, TimeBlock } from '@/modules/today/types';
import { resetWorkspaceStore, useWorkspaceStore } from '@/shared/store/useWorkspaceStore';

import {
  addMinutesToTimestamp,
  applyConfirmedMinutesToTimeBlocks,
  buildCloseDayReview,
  findTimeBlockIndexForTimestamp,
  getPendingUnconfirmedMinutes,
  getTimeBlockDurationInMinutes,
} from './pulse';

describe('pulse utilities', () => {
  it('adds minutes to an ISO timestamp', () => {
    expect(addMinutesToTimestamp('2026-03-22T09:00:00.000Z', 30)).toBe('2026-03-22T09:30:00.000Z');
  });

  it('returns the duration of a closed time block in minutes', () => {
    const timeBlock: TimeBlock = {
      projectId: 'proj-1',
      startedAt: '2026-03-22T09:00:00.000Z',
      endedAt: '2026-03-22T10:15:00.000Z',
      confirmedMinutes: 30,
    };

    expect(getTimeBlockDurationInMinutes(timeBlock)).toBe(75);
  });

  it('finds the time block that contains a timestamp', () => {
    const timeBlocks: TimeBlock[] = [
      { projectId: 'proj-1', startedAt: '2026-03-22T09:00:00.000Z', endedAt: '2026-03-22T09:45:00.000Z', confirmedMinutes: 30 },
      { projectId: 'proj-2', startedAt: '2026-03-22T09:45:00.000Z', endedAt: '2026-03-22T10:30:00.000Z', confirmedMinutes: 0 },
    ];

    expect(findTimeBlockIndexForTimestamp(timeBlocks, '2026-03-22T10:00:00.000Z')).toBe(1);
  });

  it('applies confirmed minutes to the matching time block without exceeding its duration', () => {
    const timeBlocks: TimeBlock[] = [
      { projectId: 'proj-1', startedAt: '2026-03-22T09:00:00.000Z', endedAt: '2026-03-22T09:20:00.000Z', confirmedMinutes: 0 },
    ];

    expect(applyConfirmedMinutesToTimeBlocks(timeBlocks, '2026-03-22T09:05:00.000Z', 30)).toEqual([
      { projectId: 'proj-1', startedAt: '2026-03-22T09:00:00.000Z', endedAt: '2026-03-22T09:20:00.000Z', confirmedMinutes: 20 },
    ]);
  });

  it('sums only pending unconfirmed pulse windows for close-day review', () => {
    const pulseHistory: PulseRecord[] = [
      {
        firedAt: '2026-03-22T09:30:00.000Z',
        respondedAt: null,
        status: 'unconfirmed',
        projectId: 'proj-1',
        resolution: 'pending',
        reviewedAt: null,
        confirmedMinutes: 0,
      },
      {
        firedAt: '2026-03-22T10:00:00.000Z',
        respondedAt: '2026-03-22T10:01:00.000Z',
        status: 'confirmed',
        projectId: 'proj-1',
        resolution: 'confirmed',
        reviewedAt: '2026-03-22T10:01:00.000Z',
        confirmedMinutes: 30,
      },
      {
        firedAt: '2026-03-22T10:30:00.000Z',
        respondedAt: null,
        status: 'unconfirmed',
        projectId: 'proj-2',
        resolution: 'inactive',
        reviewedAt: '2026-03-22T10:45:00.000Z',
        confirmedMinutes: 0,
      },
    ];

    expect(getPendingUnconfirmedMinutes(pulseHistory)).toBe(30);
    expect(buildCloseDayReview(pulseHistory)).toEqual({
      requiresConfirmation: true,
      unconfirmedMinutes: 30,
      message: 'Encontramos 30 min sem confirmacao. Fechar considerando apenas o tempo confirmado?',
    });
  });
});

describe('pulse store actions', () => {
  beforeEach(() => {
    resetWorkspaceStore();
  });

  it('fires and confirms a pulse while session is running', () => {
    useWorkspaceStore.getState().startSession('proj-1');
    useWorkspaceStore.getState().firePulse('2026-03-22T09:30:00.000Z');
    useWorkspaceStore.getState().confirmActivePulse('2026-03-22T09:31:00.000Z');

    const state = useWorkspaceStore.getState();

    expect(state.activePulse).toBeNull();
    expect(state.nextPulseDueAt).toBe('2026-03-22T10:01:00.000Z');
    expect(state.pulseHistory).toHaveLength(1);
    expect(state.pulseHistory[0]).toMatchObject({
      status: 'confirmed',
      resolution: 'confirmed',
      confirmedMinutes: 30,
      projectId: 'proj-1',
    });
    expect(state.timeBlocks[0].confirmedMinutes).toBeGreaterThanOrEqual(0);
  });

  it('expires a pulse into paused_inactivity and opens close-day review data', () => {
    useWorkspaceStore.getState().startSession('proj-1');
    useWorkspaceStore.getState().firePulse('2026-03-22T09:30:00.000Z');
    useWorkspaceStore.getState().expireActivePulse('2026-03-22T09:35:00.000Z');

    const state = useWorkspaceStore.getState();

    expect(state.sessionState).toBe('paused_inactivity');
    expect(state.activePulse).toBeNull();
    expect(state.nextPulseDueAt).toBeNull();
    expect(state.pulseHistory.at(-1)).toMatchObject({
      status: 'unconfirmed',
      resolution: 'pending',
      confirmedMinutes: 0,
    });
    expect(state.closeDayReview).toEqual({
      requiresConfirmation: true,
      unconfirmedMinutes: 30,
      message: 'Encontramos 30 min sem confirmacao. Fechar considerando apenas o tempo confirmado?',
    });
  });

  it('opens regularization when resuming from inactivity', () => {
    useWorkspaceStore.getState().startSession('proj-1');
    useWorkspaceStore.getState().firePulse('2026-03-22T09:30:00.000Z');
    useWorkspaceStore.getState().expireActivePulse('2026-03-22T09:35:00.000Z');
    useWorkspaceStore.getState().resumeSession();

    const state = useWorkspaceStore.getState();

    expect(state.sessionState).toBe('running');
    expect(state.regularizationState.isOpen).toBe(true);
    expect(state.regularizationState.highlightedPulseIndex).toBe(0);
  });

  it('reviews an unconfirmed pulse as confirmed and updates the matching time block', () => {
    useWorkspaceStore.getState().startSession('proj-1');
    useWorkspaceStore.getState().firePulse('2026-03-22T09:30:00.000Z');
    useWorkspaceStore.getState().expireActivePulse('2026-03-22T10:00:00.000Z');
    useWorkspaceStore.getState().reviewPulse(0, 'confirmed', '2026-03-22T10:05:00.000Z');

    const state = useWorkspaceStore.getState();

    expect(state.pulseHistory[0]).toMatchObject({
      resolution: 'confirmed',
      reviewedAt: '2026-03-22T10:05:00.000Z',
      confirmedMinutes: 30,
    });
    expect(state.closeDayReview).toEqual({
      requiresConfirmation: false,
      unconfirmedMinutes: 0,
      message: null,
    });
  });

  it('allows manual time-block edits from regularization data', () => {
    useWorkspaceStore.getState().startSession('proj-1');
    useWorkspaceStore.getState().updateTimeBlock(0, { projectId: 'proj-2', confirmedMinutes: 45 });

    const state = useWorkspaceStore.getState();

    expect(state.timeBlocks[0]).toMatchObject({ projectId: 'proj-2', confirmedMinutes: 45 });
  });

  it('prepares close-day review without mutating session state', () => {
    useWorkspaceStore.getState().startSession('proj-1');
    useWorkspaceStore.getState().firePulse('2026-03-22T09:30:00.000Z');
    useWorkspaceStore.getState().expireActivePulse('2026-03-22T09:35:00.000Z');

    const review = useWorkspaceStore.getState().prepareCloseDayReview();
    const state = useWorkspaceStore.getState();

    expect(review.requiresConfirmation).toBe(true);
    expect(state.sessionState).toBe('paused_inactivity');
    expect(state.closeDayReview).toEqual(review);
  });

  it('closes from paused inactivity using only confirmed minutes in the cycle snapshot', () => {
    useWorkspaceStore.getState().startSession('proj-1');
    useWorkspaceStore.getState().firePulse('2026-03-22T09:30:00.000Z');
    useWorkspaceStore.getState().expireActivePulse('2026-03-22T09:35:00.000Z');
    useWorkspaceStore.getState().closeDay();

    const state = useWorkspaceStore.getState();

    expect(state.sessionState).toBe('completed');
    expect(state.cycleSnapshot?.actualHours).toBe(0);
    expect(state.closeDayReview).toEqual({
      requiresConfirmation: true,
      unconfirmedMinutes: 30,
      message: 'Encontramos 30 min sem confirmacao. Fechar considerando apenas o tempo confirmado?',
    });
  });
});