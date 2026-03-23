import assert from 'node:assert/strict';
import test from 'node:test';

import { getPreviousWeekKey, getWeekDayLabel, getWeekInfoFromDate, getWeekInfoFromWeekKey, listWeekKeysInRange } from '@/modules/weekly/utils/weekly-boundary';

test('weekly boundary resolves ISO week info from operational date', () => {
  const weekInfo = getWeekInfoFromDate('2026-03-22');

  assert.equal(weekInfo.weekKey, '2026-W12');
  assert.equal(weekInfo.weekStartsAt, '2026-03-16');
  assert.equal(weekInfo.weekEndsAt, '2026-03-22');
  assert.equal(getWeekDayLabel('2026-03-22'), 'Dom');
});

test('weekly boundary rebuilds ranges from week keys', () => {
  const weekInfo = getWeekInfoFromWeekKey('2026-W12');

  assert.equal(weekInfo.weekStartsAt, '2026-03-16');
  assert.equal(weekInfo.weekEndsAt, '2026-03-22');
  assert.deepEqual(listWeekKeysInRange('2026-W10', '2026-W12'), ['2026-W10', '2026-W11', '2026-W12']);
  assert.equal(getPreviousWeekKey('2026-W12'), '2026-W11');
});