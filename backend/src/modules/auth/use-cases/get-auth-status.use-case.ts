import { Injectable } from '@nestjs/common';

import { env } from '@/shared/config';

@Injectable()
export class GetAuthStatusUseCase {
  execute() {
    const oauthConfigured = Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && env.GOOGLE_REDIRECT_URI);
    const firebaseConfigured = Boolean(
      env.FIREBASE_SERVICE_ACCOUNT_JSON
      || env.FIREBASE_SERVICE_ACCOUNT_PATH
      || (env.FIREBASE_PROJECT_ID && env.FIREBASE_CLIENT_EMAIL && env.FIREBASE_PRIVATE_KEY),
    );

    return {
      emailPasswordEnabled: true,
      firebaseConfigured,
      oauthConfigured,
      provider: 'google',
      status: oauthConfigured ? 'ready' : 'pending',
    } as const;
  }
}