import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { env } from '@/shared/config';

import type { GoogleOauthState } from '@/modules/auth/types/auth';

@Injectable()
export class BuildGoogleLinkUrlUseCase {
  execute(input: GoogleOauthState) {
    if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_REDIRECT_URI) {
      throw new InternalServerErrorException('Google OAuth is not configured.');
    }

    const state = Buffer.from(JSON.stringify(input)).toString('base64url');
    const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');

    url.searchParams.set('access_type', 'offline');
    url.searchParams.set('client_id', env.GOOGLE_CLIENT_ID);
    url.searchParams.set('include_granted_scopes', 'true');
    url.searchParams.set('prompt', 'consent');
    url.searchParams.set('redirect_uri', env.GOOGLE_REDIRECT_URI);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', [
      'openid',
      'email',
      'profile',
      'https://www.googleapis.com/auth/calendar',
    ].join(' '));
    url.searchParams.set('state', state);

    return url.toString();
  }
}