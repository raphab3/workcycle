import { Injectable } from '@nestjs/common';

import { env } from '@/shared/config';

@Injectable()
export class GetAuthStatusUseCase {
  execute() {
    const oauthConfigured = Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && env.GOOGLE_REDIRECT_URI);

    return {
      emailPasswordEnabled: true,
      oauthConfigured,
      provider: 'google',
      status: oauthConfigured ? 'ready' : 'pending',
    } as const;
  }
}