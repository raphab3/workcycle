import assert from 'node:assert/strict';
import test from 'node:test';

import { buildCloseDayReview } from '@/modules/cycle/utils/pulse';

test('buildCloseDayReview flags significant unconfirmed minutes', () => {
  const review = buildCloseDayReview([
    {
      confirmedMinutes: 0,
      firedAt: '2026-03-23T09:00:00.000Z',
      projectId: null,
      resolution: 'pending',
      respondedAt: null,
      reviewedAt: null,
      status: 'unconfirmed',
    },
  ]);

  assert.equal(review.requiresConfirmation, true);
  assert.equal(review.unconfirmedMinutes, 30);
});