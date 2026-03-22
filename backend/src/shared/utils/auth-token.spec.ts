import assert from 'node:assert/strict';
import test from 'node:test';

import { issueAccessToken, issueRefreshToken, verifyAccessToken, verifyRefreshToken } from '@/shared/utils/auth-token';

const baseInput = {
  displayName: 'Rafa',
  email: 'rafa@example.com',
  provider: 'email' as const,
  userId: 'user-1',
};

test('issues and validates access tokens with the bearer contract', () => {
  const issued = issueAccessToken(baseInput);
  const payload = verifyAccessToken(issued.token);

  assert.ok(payload);
  assert.equal(payload?.sub, baseInput.userId);
  assert.equal(payload?.tokenType, 'access');
  assert.match(issued.expiresAt, /^\d{4}-\d{2}-\d{2}T/);
});

test('rejects using a refresh token where an access token is required', () => {
  const issued = issueRefreshToken(baseInput);

  assert.equal(verifyAccessToken(issued.token), null);
  assert.ok(verifyRefreshToken(issued.token));
});