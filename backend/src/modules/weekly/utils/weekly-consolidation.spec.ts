import assert from 'node:assert/strict';
import test from 'node:test';

import { buildWeeklySnapshot } from '@/modules/weekly/utils/weekly-consolidation';

test('buildWeeklySnapshot marks the current open day as provisional and uses live tracked hours for open week data', () => {
  const snapshot = buildWeeklySnapshot({
    currentCycleDate: '2026-03-22',
    generatedAt: '2026-03-22T12:00:00.000Z',
    isFinal: false,
    projects: [
      {
        allocationPct: 10,
        colorHex: '#0F766E',
        createdAt: new Date('2026-03-01T00:00:00.000Z'),
        fixedDays: [],
        fixedHoursPerDay: 0,
        id: 'project-1',
        name: 'DataVault',
        sprintDays: 7,
        status: 'active',
        type: 'rotative',
        updatedAt: new Date('2026-03-01T00:00:00.000Z'),
        userId: 'user-1',
      },
    ],
    sessions: [
      {
        activeProjectId: 'project-1',
        closedAt: null,
        createdAt: new Date('2026-03-22T08:00:00.000Z'),
        cycleDate: '2026-03-22',
        id: 'session-1',
        previousCycleDate: null,
        rolloverNoticeDescription: null,
        rolloverNoticeTitle: null,
        rolloverStrategy: 'manual-start-next',
        rolloverTriggeredAt: null,
        snapshot: null,
        startedAt: new Date('2026-03-22T08:00:00.000Z'),
        state: 'running',
        updatedAt: new Date('2026-03-22T08:00:00.000Z'),
        userId: 'user-1',
      },
    ],
    tasks: [],
    timeBlocks: [
      {
        confirmedMinutes: 30,
        createdAt: new Date('2026-03-22T08:00:00.000Z'),
        cycleSessionId: 'session-1',
        endedAt: null,
        id: 'block-1',
        projectId: 'project-1',
        startedAt: new Date('2026-03-22T08:00:00.000Z'),
        updatedAt: new Date('2026-03-22T08:00:00.000Z'),
        userId: 'user-1',
      },
    ],
    timezone: 'UTC',
    weekKey: '2026-W12',
  });

  assert.equal(snapshot.isFinal, false);
  assert.equal(snapshot.source, 'derived-open-week');
  assert.equal(snapshot.rows[0]?.actualWeekHours, 4);
  assert.equal(snapshot.rows[0]?.cells.find((cell) => cell.date === '2026-03-22')?.isProvisional, true);
});

test('buildWeeklySnapshot uses confirmed minutes for final historical weeks', () => {
  const snapshot = buildWeeklySnapshot({
    currentCycleDate: '2026-03-22',
    generatedAt: '2026-03-22T12:00:00.000Z',
    isFinal: true,
    projects: [
      {
        allocationPct: 25,
        colorHex: '#0F172A',
        createdAt: new Date('2026-03-01T00:00:00.000Z'),
        fixedDays: ['Seg', 'Ter'],
        fixedHoursPerDay: 2,
        id: 'project-1',
        name: 'ClienteCore',
        sprintDays: 14,
        status: 'active',
        type: 'fixed',
        updatedAt: new Date('2026-03-01T00:00:00.000Z'),
        userId: 'user-1',
      },
    ],
    sessions: [
      {
        activeProjectId: 'project-1',
        closedAt: new Date('2026-03-17T18:00:00.000Z'),
        createdAt: new Date('2026-03-17T08:00:00.000Z'),
        cycleDate: '2026-03-17',
        id: 'session-1',
        previousCycleDate: null,
        rolloverNoticeDescription: null,
        rolloverNoticeTitle: null,
        rolloverStrategy: 'manual-start-next',
        rolloverTriggeredAt: null,
        snapshot: null,
        startedAt: new Date('2026-03-17T08:00:00.000Z'),
        state: 'completed',
        updatedAt: new Date('2026-03-17T18:00:00.000Z'),
        userId: 'user-1',
      },
    ],
    tasks: [],
    timeBlocks: [
      {
        confirmedMinutes: 90,
        createdAt: new Date('2026-03-17T08:00:00.000Z'),
        cycleSessionId: 'session-1',
        endedAt: new Date('2026-03-17T09:30:00.000Z'),
        id: 'block-1',
        projectId: 'project-1',
        startedAt: new Date('2026-03-17T08:00:00.000Z'),
        updatedAt: new Date('2026-03-17T09:30:00.000Z'),
        userId: 'user-1',
      },
    ],
    timezone: 'UTC',
    weekKey: '2026-W12',
  });

  assert.equal(snapshot.rows[0]?.actualWeekHours, 1.5);
  assert.equal(snapshot.rows[0]?.cells.find((cell) => cell.date === '2026-03-17')?.isProvisional, false);
});