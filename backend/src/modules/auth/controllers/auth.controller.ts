import { Body, Controller, Get, Inject, Post, Query, Res, UseGuards } from '@nestjs/common';

import type { FastifyReply } from 'fastify';

import { firebaseSessionSchema, loginSchema, registerSchema } from '@/modules/auth/auth.schemas';
import { AuthFinderService } from '@/modules/auth/services/auth-finder.service';
import { AuthWriterService } from '@/modules/auth/services/auth-writer.service';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { AuthGuard } from '@/shared/guards/auth.guard';

import type { AuthTokenPayload } from '@/modules/auth/types/auth';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AuthFinderService)
    private readonly authFinderService: AuthFinderService,
    @Inject(AuthWriterService)
    private readonly authWriterService: AuthWriterService,
  ) {}

  @Get('status')
  getStatus() {
    return this.authFinderService.getStatus();
  }

  @Post('register')
  async register(@Body() body: unknown) {
    const input = registerSchema.parse(body);

    return this.authWriterService.register(input);
  }

  @Post('login')
  async login(@Body() body: unknown) {
    const input = loginSchema.parse(body);

    return this.authWriterService.login(input);
  }

  @Post('firebase/session')
  async createFirebaseSession(@Body() body: unknown) {
    const input = firebaseSessionSchema.parse(body);

    return this.authWriterService.loginWithFirebase(input.idToken);
  }

  @UseGuards(AuthGuard)
  @Get('session')
  async getSession(@CurrentUser() user: AuthTokenPayload) {
    return this.authFinderService.getSession(user);
  }

  @Get('google/start')
  googleStart(@Res() reply: FastifyReply) {
    return reply.redirect(this.authWriterService.getGoogleLoginUrl());
  }

  @UseGuards(AuthGuard)
  @Get('google/link-url')
  async getGoogleLinkUrl(@CurrentUser() user: AuthTokenPayload) {
    return this.authWriterService.getGoogleLinkUrl(user);
  }

  @Get('google/callback')
  async googleCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() reply: FastifyReply,
  ) {
    const redirectUrl = await this.authWriterService.handleGoogleCallback(code, state);

    return reply.redirect(redirectUrl);
  }
}