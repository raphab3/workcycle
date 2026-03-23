import assert from 'node:assert/strict';
import test from 'node:test';

import { GetCycleStatusUseCase } from '@/modules/cycle/use-cases/get-cycle-status.use-case';

test('GetCycleStatusUseCase exposes the canonical Today contract status', () => {
  const useCase = new GetCycleStatusUseCase();
  const result = useCase.execute();

  assert.equal(result.status, 'defined');
  assert.equal(result.targetSession.taskScope.relationMode, 'cycle-session-and-assignment');
  assert.equal(result.auditTrailDecision.minimumMode, 'inline-pulse-history');
});