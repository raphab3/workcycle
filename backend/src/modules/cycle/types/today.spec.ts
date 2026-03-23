import assert from 'node:assert/strict';
import test from 'node:test';

import { createTodayContractStatus } from '@/modules/cycle/types/today';

test('createTodayContractStatus defines the canonical Today contract for the MVP', () => {
  const contract = createTodayContractStatus();

  assert.equal(contract.status, 'defined');
  assert.equal(contract.auditTrailDecision.minimumMode, 'inline-pulse-history');
  assert.equal(contract.auditTrailDecision.separateAuditTableRequired, false);
  assert.equal(contract.targetSession.taskScope.relationMode, 'cycle-session-and-assignment');
  assert.equal(contract.targetSession.operationalBoundary.timezone, 'UTC');
  assert.equal(contract.targetSession.operationalBoundary.cycleStartHour, '00:00');
  assert.deepEqual(contract.targetSession.timeBlocks, []);
  assert.deepEqual(contract.targetSession.pulses.history, []);
});