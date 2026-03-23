import assert from 'node:assert/strict';
import test from 'node:test';

import { updateTodaySessionSchema, upsertPulseRecordSchema } from '@/modules/cycle/cycle.schemas';
import { todayContractStatusSchema } from '@/modules/cycle/cycle.schemas';
import { createTodayContractStatus } from '@/modules/cycle/types/today';

test('updateTodaySessionSchema accepts a valid Today session update payload', () => {
  const parsed = updateTodaySessionSchema.parse({
    activeProjectId: null,
    state: 'running',
    timeBlocks: [
      {
        projectId: '7f6c59b0-b0d2-4f44-b73c-5f7f67f0c165',
        startedAt: '2026-03-23T09:00:00.000Z',
      },
    ],
  });

  assert.equal(parsed.state, 'running');
  assert.equal(parsed.timeBlocks?.[0]?.confirmedMinutes, 0);
});

test('upsertPulseRecordSchema rejects invalid pulse minutes', () => {
  assert.throws(() => upsertPulseRecordSchema.parse({
    confirmedMinutes: 45,
    firedAt: '2026-03-23T09:00:00.000Z',
    resolution: 'confirmed',
    sessionId: '7f6c59b0-b0d2-4f44-b73c-5f7f67f0c165',
    status: 'confirmed',
  }), /Too big: expected number to be <=30/);
});

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