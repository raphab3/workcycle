import { Controller, Get } from '@nestjs/common';

import { AuthFinderService } from '@/modules/auth/services/auth-finder.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authFinderService: AuthFinderService) {}

  @Get('status')
  getStatus() {
    return this.authFinderService.getStatus();
  }
}