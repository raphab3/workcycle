import assert from 'node:assert/strict';
import test from 'node:test';

import { BuildGoogleLinkUrlUseCase } from '@/modules/auth/use-cases/build-google-link-url.use-case';
import { env } from '@/shared/config';

test('BuildGoogleLinkUrlUseCase requests consent and account selection for Google OAuth', () => {
  const originalClientId = env.GOOGLE_CLIENT_ID;
  const originalRedirectUri = env.GOOGLE_REDIRECT_URI;

  env.GOOGLE_CLIENT_ID = 'client-id';
  env.GOOGLE_REDIRECT_URI = 'http://localhost:3333/api/auth/google/callback';

  try {
    const useCase = new BuildGoogleLinkUrlUseCase();
    const url = new URL(
      useCase.execute({
        issuedAt: Date.now(),
        mode: 'link',
        userId: 'user-1',
      }),
    );

    assert.equal(url.searchParams.get('prompt'), 'consent select_account');
    assert.equal(url.searchParams.get('include_granted_scopes'), 'true');
  } finally {
    env.GOOGLE_CLIENT_ID = originalClientId;
    env.GOOGLE_REDIRECT_URI = originalRedirectUri;
  }
});