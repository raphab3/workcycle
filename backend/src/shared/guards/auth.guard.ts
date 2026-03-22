import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

import { verifyAccessToken } from '@/shared/utils/auth-token';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const authorizationHeader = request.headers.authorization;

    if (!authorizationHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authentication token is missing.');
    }

    const token = authorizationHeader.replace('Bearer ', '').trim();
    const user = verifyAccessToken(token);

    if (!user) {
      throw new UnauthorizedException('Authentication token is invalid or expired.');
    }

    request.user = user;

    return true;
  }
}