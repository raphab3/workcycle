import assert from 'node:assert/strict';
import test from 'node:test';

import { todayContractStatusSchema } from '@/modules/cycle/cycle.schemas';
import { createTodayContractStatus } from '@/modules/cycle/types/today';

test('todayContractStatusSchema accepts the canonical Today contract payload', () => {
  const parsed = todayContractStatusSchema.parse(createTodayContractStatus());

  assert.equal(parsed.status, 'defined');
  assert.equal(parsed.targetSession.state, 'idle');
  assert.equal(parsed.targetSession.rollover.strategy, 'manual-start-next');
});

test('todayContractStatusSchema rejects malformed cycleDate values', () => {
  const invalidContract = {
    ...createTodayContractStatus(),
    targetSession: {
      ...createTodayContractStatus().targetSession,
      cycleDate: '23-03-2026',
    },
  };

  assert.throws(() => todayContractStatusSchema.parse(invalidContract), /Use o formato YYYY-MM-DD para cycleDate\./);
});