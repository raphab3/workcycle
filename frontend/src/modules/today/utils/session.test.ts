import type { Task } from '@/modules/tasks/types';
import type { TimeBlock } from '@/modules/today/types';
import { resetWorkspaceStore, useWorkspaceStore } from '@/shared/store/useWorkspaceStore';

import { computeCycleSnapshot, getConfirmedMinutes, getOpenTimeBlock } from './session';

describe('session helpers', () => {
  describe('getOpenTimeBlock', () => {
    it('returns the block with endedAt === null', () => {
      const blocks: TimeBlock[] = [
        { projectId: 'p1', startedAt: '2026-03-22T08:00:00Z', endedAt: '2026-03-22T09:00:00Z', confirmedMinutes: 60 },
        { projectId: 'p2', startedAt: '2026-03-22T09:00:00Z', endedAt: null, confirmedMinutes: 0 },
      ];

      expect(getOpenTimeBlock(blocks)).toEqual(blocks[1]);
    });

    it('returns null when all blocks are closed', () => {
      const blocks: TimeBlock[] = [
        { projectId: 'p1', startedAt: '2026-03-22T08:00:00Z', endedAt: '2026-03-22T09:00:00Z', confirmedMinutes: 60 },
      ];

      expect(getOpenTimeBlock(blocks)).toBeNull();
    });

    it('returns null for empty array', () => {
      expect(getOpenTimeBlock([])).toBeNull();
    });
  });

  describe('getConfirmedMinutes', () => {
    it('sums only closed blocks confirmedMinutes', () => {
      const blocks: TimeBlock[] = [
        { projectId: 'p1', startedAt: '2026-03-22T08:00:00Z', endedAt: '2026-03-22T09:00:00Z', confirmedMinutes: 60 },
        { projectId: 'p2', startedAt: '2026-03-22T09:00:00Z', endedAt: '2026-03-22T10:00:00Z', confirmedMinutes: 45 },
        { projectId: 'p3', startedAt: '2026-03-22T10:00:00Z', endedAt: null, confirmedMinutes: 30 },
      ];

      expect(getConfirmedMinutes(blocks)).toBe(105);
    });

    it('returns 0 for empty array', () => {
      expect(getConfirmedMinutes([])).toBe(0);
    });
  });

  describe('computeCycleSnapshot', () => {
    const baseTasks: Task[] = [
      { id: 't1', title: 'Done task', description: '', projectId: 'p1', columnId: 'c1', isArchived: false, checklist: [], priority: 'medium', status: 'done', cycleAssignment: 'current', dueInDays: 0, estimatedHours: 1 },
      { id: 't2', title: 'In progress task', description: '', projectId: 'p1', columnId: 'c1', isArchived: false, checklist: [], priority: 'medium', status: 'doing', cycleAssignment: 'current', dueInDays: 0, estimatedHours: 2 },
      { id: 't3', title: 'Backlog task', description: '', projectId: 'p1', columnId: 'c1', isArchived: false, checklist: [], priority: 'low', status: 'todo', cycleAssignment: 'backlog', dueInDays: 0, estimatedHours: 1 },
    ];

    it('completedTaskIds contains only done + current tasks', () => {
      const snapshot = computeCycleSnapshot({
        tasks: baseTasks,
        timeBlocks: [],
        todayCycleValues: { availableHours: 8, projectsInCycle: 2 },
      });

      expect(snapshot.completedTaskIds).toEqual(['t1']);
    });

    it('incompleteTaskIds contains only current + non-done tasks', () => {
      const snapshot = computeCycleSnapshot({
        tasks: baseTasks,
        timeBlocks: [],
        todayCycleValues: { availableHours: 8, projectsInCycle: 2 },
      });

      expect(snapshot.incompleteTaskIds).toEqual(['t2']);
    });

    it('actualHours equals confirmedMinutes / 60', () => {
      const blocks: TimeBlock[] = [
        { projectId: 'p1', startedAt: '2026-03-22T08:00:00Z', endedAt: '2026-03-22T09:00:00Z', confirmedMinutes: 90 },
      ];

      const snapshot = computeCycleSnapshot({
        tasks: baseTasks,
        timeBlocks: blocks,
        todayCycleValues: { availableHours: 8, projectsInCycle: 2 },
      });

      expect(snapshot.actualHours).toBe(1.5);
    });
  });
});

describe('session store actions', () => {
  beforeEach(() => {
    resetWorkspaceStore();
  });

  describe('startSession', () => {
    it('transitions from idle to running and sets up session', () => {
      useWorkspaceStore.getState().startSession('proj-1');
      const state = useWorkspaceStore.getState();

      expect(state.sessionState).toBe('running');
      expect(state.activeProjectId).toBe('proj-1');
      expect(state.sessionStartedAt).not.toBeNull();
      expect(state.cycleState).toBe('ACTIVE');
      expect(state.timeBlocks).toHaveLength(1);
      expect(state.timeBlocks[0].projectId).toBe('proj-1');
      expect(state.timeBlocks[0].endedAt).toBeNull();
    });

    it('does not restart an already running session', () => {
      useWorkspaceStore.getState().startSession('proj-1');
      const firstStartAt = useWorkspaceStore.getState().sessionStartedAt;

      useWorkspaceStore.getState().startSession('proj-2');
      const state = useWorkspaceStore.getState();

      expect(state.sessionState).toBe('running');
      expect(state.activeProjectId).toBe('proj-1');
      expect(state.sessionStartedAt).toBe(firstStartAt);
      expect(state.timeBlocks).toHaveLength(1);
    });
  });

  describe('pauseSession', () => {
    it('manual pause transitions to paused_manual and closes time block', () => {
      useWorkspaceStore.getState().startSession('proj-1');
      useWorkspaceStore.getState().pauseSession('manual');
      const state = useWorkspaceStore.getState();

      expect(state.sessionState).toBe('paused_manual');
      expect(state.timeBlocks[0].endedAt).not.toBeNull();
    });

    it('inactivity pause transitions to paused_inactivity', () => {
      useWorkspaceStore.getState().startSession('proj-1');
      useWorkspaceStore.getState().pauseSession('inactivity');
      const state = useWorkspaceStore.getState();

      expect(state.sessionState).toBe('paused_inactivity');
    });
  });

  describe('resumeSession', () => {
    it('transitions from paused_manual to running and adds new time block', () => {
      useWorkspaceStore.getState().startSession('proj-1');
      useWorkspaceStore.getState().pauseSession('manual');
      useWorkspaceStore.getState().resumeSession();
      const state = useWorkspaceStore.getState();

      expect(state.sessionState).toBe('running');
      expect(state.timeBlocks).toHaveLength(2);
      expect(state.timeBlocks[1].endedAt).toBeNull();
    });

    it('does nothing when there is no active project to resume', () => {
      useWorkspaceStore.setState({
        sessionState: 'paused_inactivity',
        activeProjectId: null,
        timeBlocks: [],
      });

      useWorkspaceStore.getState().resumeSession();
      const state = useWorkspaceStore.getState();

      expect(state.sessionState).toBe('paused_inactivity');
      expect(state.timeBlocks).toHaveLength(0);
    });
  });

  describe('switchActiveProject', () => {
    it('closes current open block and opens new block for new project', () => {
      useWorkspaceStore.getState().startSession('proj-1');
      useWorkspaceStore.getState().switchActiveProject('proj-2');
      const state = useWorkspaceStore.getState();

      expect(state.activeProjectId).toBe('proj-2');
      expect(state.timeBlocks).toHaveLength(2);
      expect(state.timeBlocks[0].endedAt).not.toBeNull();
      expect(state.timeBlocks[1].projectId).toBe('proj-2');
      expect(state.timeBlocks[1].endedAt).toBeNull();
    });

    it('opens new block when running with no open block', () => {
      useWorkspaceStore.getState().startSession('proj-1');
      useWorkspaceStore.getState().pauseSession('manual');
      useWorkspaceStore.getState().resumeSession();
      // Close the open block manually by pausing, then resume to get running state
      useWorkspaceStore.getState().pauseSession('manual');
      useWorkspaceStore.getState().resumeSession();
      // Now switch — all prior blocks are closed, a new one should open
      useWorkspaceStore.getState().switchActiveProject('proj-2');
      const state = useWorkspaceStore.getState();

      expect(state.activeProjectId).toBe('proj-2');
      expect(state.timeBlocks[state.timeBlocks.length - 1].projectId).toBe('proj-2');
      expect(state.timeBlocks[state.timeBlocks.length - 1].endedAt).toBeNull();
    });

    it('does not create a time block when session is idle', () => {
      useWorkspaceStore.getState().switchActiveProject('proj-2');
      const state = useWorkspaceStore.getState();

      expect(state.activeProjectId).toBe('proj-2');
      expect(state.timeBlocks).toHaveLength(0);
    });

    it('does not create additional time blocks when selecting the already active project while running', () => {
      useWorkspaceStore.getState().startSession('proj-1');
      const stateBeforeSwitch = useWorkspaceStore.getState();

      useWorkspaceStore.getState().switchActiveProject('proj-1');
      const stateAfterSwitch = useWorkspaceStore.getState();

      expect(stateAfterSwitch.activeProjectId).toBe('proj-1');
      expect(stateAfterSwitch.timeBlocks).toHaveLength(stateBeforeSwitch.timeBlocks.length);
      expect(stateAfterSwitch.timeBlocks).toEqual(stateBeforeSwitch.timeBlocks);
    });

    it('does not close the open block when selecting the same project while running', () => {
      useWorkspaceStore.getState().startSession('proj-1');
      useWorkspaceStore.getState().switchActiveProject('proj-1');
      const state = useWorkspaceStore.getState();

      expect(state.timeBlocks).toHaveLength(1);
      expect(state.timeBlocks[0].endedAt).toBeNull();
    });
  });

  describe('closeDay', () => {
    it('from running: transitions to completed with CLOSED (not AUTO_CLOSED) state', () => {
      useWorkspaceStore.getState().startSession('proj-1');
      useWorkspaceStore.getState().closeDay();
      const state = useWorkspaceStore.getState();

      expect(state.sessionState).toBe('completed');
      expect(state.cycleState).toBe('CLOSED');
      expect(state.cycleState).not.toBe('AUTO_CLOSED');
      expect(state.cycleSnapshot).not.toBeNull();
      expect(state.timeBlocks.every((b) => b.endedAt !== null)).toBe(true);
    });

    it('from paused_manual: transitions to completed', () => {
      useWorkspaceStore.getState().startSession('proj-1');
      useWorkspaceStore.getState().pauseSession('manual');
      useWorkspaceStore.getState().closeDay();
      const state = useWorkspaceStore.getState();

      expect(state.sessionState).toBe('completed');
      expect(state.cycleState).toBe('CLOSED');
      expect(state.cycleSnapshot).not.toBeNull();
    });

    it('from paused_inactivity: transitions to completed', () => {
      useWorkspaceStore.getState().startSession('proj-1');
      useWorkspaceStore.getState().pauseSession('inactivity');
      useWorkspaceStore.getState().closeDay();
      const state = useWorkspaceStore.getState();

      expect(state.sessionState).toBe('completed');
      expect(state.cycleState).toBe('CLOSED');
      expect(state.cycleSnapshot).not.toBeNull();
    });

    it('does nothing when the session has not started', () => {
      const initialState = useWorkspaceStore.getState();

      useWorkspaceStore.getState().closeDay();
      const state = useWorkspaceStore.getState();

      expect(state.sessionState).toBe(initialState.sessionState);
      expect(state.cycleState).toBe(initialState.cycleState);
      expect(state.cycleSnapshot).toBeNull();
    });
  });

  describe('setCycleState', () => {
    it('directly updates cycleState', () => {
      useWorkspaceStore.getState().setCycleState('RECONCILED');

      expect(useWorkspaceStore.getState().cycleState).toBe('RECONCILED');
    });

    it('allows AUTO_CLOSED to be set explicitly via setCycleState for day-boundary automation', () => {
      useWorkspaceStore.getState().setCycleState('AUTO_CLOSED');

      expect(useWorkspaceStore.getState().cycleState).toBe('AUTO_CLOSED');
    });
  });

  describe('cycleDate initialization', () => {
    it('uses local date format YYYY-MM-DD matching local time', () => {
      const state = useWorkspaceStore.getState();
      const now = new Date();
      const expectedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

      expect(state.cycleDate).toBe(expectedDate);
      expect(state.cycleDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('recordPulse', () => {
    it('confirmed pulse has non-null respondedAt', () => {
      useWorkspaceStore.getState().recordPulse('confirmed');
      const pulse = useWorkspaceStore.getState().pulseHistory[0];

      expect(pulse.status).toBe('confirmed');
      expect(pulse.respondedAt).not.toBeNull();
    });

    it('unconfirmed pulse has null respondedAt', () => {
      useWorkspaceStore.getState().recordPulse('unconfirmed');
      const pulse = useWorkspaceStore.getState().pulseHistory[0];

      expect(pulse.status).toBe('unconfirmed');
      expect(pulse.respondedAt).toBeNull();
    });
  });
});
