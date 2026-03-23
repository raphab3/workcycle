import assert from 'node:assert/strict';
import test from 'node:test';

import { GetWeeklySnapshotUseCase } from '@/modules/weekly/use-cases/get-weekly-snapshot.use-case';

test('GetWeeklySnapshotUseCase returns persisted history for a closed week when available', async () => {
  const persistedSnapshot = {
    generatedAt: '2026-03-22T12:00:00.000Z',
    isFinal: true,
    rows: [],
    source: 'persisted-weekly-history' as const,
    summary: {
      actualWeekHours: 12,
      attentionProjects: 0,
      criticalProjects: 0,
      plannedWeekHours: 12,
    },
    timezone: 'UTC',
    weekEndsAt: '2000-01-09',
    weekKey: '2000-W01',
    weekStartsAt: '2000-01-03',
  };
  const weeklyRepository = {
    findWeeklySnapshot: async () => ({ snapshot: persistedSnapshot }),
    listCycleSessionsForWeek: async () => [],
    listProjects: async () => [],
    listTasks: async () => [],
    listTimeBlocksForSessions: async () => [],
    upsertWeeklySnapshot: async () => null,
  };
  const settingsFinderService = {
    getUserSettings: async () => ({
      cycleStartHour: '00:00',
      dailyReviewTime: '18:00',
      googleConnection: {
        connectedAccountCount: 0,
        hasGoogleLinked: false,
        linkedAt: null,
      },
      notificationsEnabled: false,
      timezone: 'UTC',
    }),
  };
  const useCase = new GetWeeklySnapshotUseCase(weeklyRepository as never, settingsFinderService as never);

  const result = await useCase.execute('user-1', '2000-W01');

  assert.deepEqual(result, persistedSnapshot);
});

test('GetWeeklySnapshotUseCase still derives the week when weekly snapshot persistence is unavailable', async () => {
  const weeklyRepository = {
    findWeeklySnapshot: async () => {
      throw new Error('relation "weekly_snapshots" does not exist');
    },
    listCycleSessionsForWeek: async () => [],
    listProjects: async () => [],
    listTasks: async () => [],
    listTimeBlocksForSessions: async () => [],
    upsertWeeklySnapshot: async () => null,
  };
  const settingsFinderService = {
    getUserSettings: async () => ({
      cycleStartHour: '00:00',
      dailyReviewTime: '18:00',
      googleConnection: {
        connectedAccountCount: 0,
        hasGoogleLinked: false,
        linkedAt: null,
      },
      notificationsEnabled: false,
      timezone: 'UTC',
    }),
  };
  const useCase = new GetWeeklySnapshotUseCase(weeklyRepository as never, settingsFinderService as never);

  const result = await useCase.execute('user-1');

  assert.equal(typeof result.weekKey, 'string');
  assert.equal(Array.isArray(result.rows), true);
});