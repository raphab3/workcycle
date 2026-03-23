import assert from 'node:assert/strict';
import test from 'node:test';

import { getTableColumns } from 'drizzle-orm';

import { userSettings } from '@/shared/database/schema';

test('user settings schema persists the operational preference fields required by Settings', () => {
  const columns = getTableColumns(userSettings);

  assert.ok(columns.userId);
  assert.ok(columns.timezone);
  assert.ok(columns.notificationsEnabled);
  assert.ok(columns.dailyReviewTime);
  assert.ok(columns.cycleStartHour);
});