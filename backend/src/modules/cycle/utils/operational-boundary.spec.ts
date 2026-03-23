import assert from 'node:assert/strict';
import test from 'node:test';

import { buildOperationalBoundary, getPulseWindowKey, resolveOperationalCycleDate } from '@/modules/cycle/utils/operational-boundary';

test('resolveOperationalCycleDate respects timezone and cycleStartHour', () => {
  const cycleDate = resolveOperationalCycleDate('2026-03-23T01:30:00.000Z', {
    cycleStartHour: '00:00',
    timezone: 'America/Sao_Paulo',
  });

  assert.equal(cycleDate, '2026-03-22');
});

test('buildOperationalBoundary derives boundary start and rollover window', () => {
  const boundary = buildOperationalBoundary('2026-03-23', {
    cycleStartHour: '00:00',
    timezone: 'UTC',
  });

  assert.equal(boundary.boundaryStartsAt, '2026-03-23T00:00:00.000Z');
  assert.equal(boundary.rolloverWindow.startsAt, '2026-03-23T23:55:00.000Z');
  assert.equal(boundary.rolloverWindow.endsAt, '2026-03-24T00:05:00.000Z');
});

test('getPulseWindowKey groups pulses by the canonical 30 minute bucket', () => {
  assert.equal(getPulseWindowKey('2026-03-23T10:05:00.000Z'), getPulseWindowKey('2026-03-23T10:29:59.000Z'));
});