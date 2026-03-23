import assert from 'node:assert/strict';
import test from 'node:test';

import { getWeeklyHistoryQuerySchema, weeklySnapshotResponseSchema } from '@/modules/weekly/weekly.schemas';

test('weeklySnapshotResponseSchema accepts a valid hybrid weekly payload', () => {
  const parsed = weeklySnapshotResponseSchema.parse({
    generatedAt: '2026-03-22T10:00:00.000Z',
    isFinal: false,
    rows: [
      {
        actualWeekHours: 7,
        cells: [
          {
            actualHours: 2,
            date: '2026-03-16',
            day: 'Seg',
            isProvisional: false,
            plannedHours: 2,
          },
        ],
        colorHex: '#0F766E',
        deltaHours: 1,
        plannedWeekHours: 6,
        projectId: 'project-1',
        projectName: 'DataVault',
        status: 'attention',
      },
    ],
    source: 'derived-open-week',
    summary: {
      actualWeekHours: 7,
      attentionProjects: 1,
      criticalProjects: 0,
      plannedWeekHours: 6,
    },
    timezone: 'UTC',
    weekEndsAt: '2026-03-22',
    weekKey: '2026-W12',
    weekStartsAt: '2026-03-16',
  });

  assert.equal(parsed.weekKey, '2026-W12');
  assert.equal(parsed.rows[0]?.cells[0]?.day, 'Seg');
});

test('getWeeklyHistoryQuerySchema rejects inverted week ranges', () => {
  assert.throws(() => getWeeklyHistoryQuerySchema.parse({
    fromWeekKey: '2026-W12',
    toWeekKey: '2026-W11',
  }), /fromWeekKey precisa ser menor ou igual a toWeekKey\./);
});