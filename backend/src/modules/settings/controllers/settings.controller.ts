import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';

import { updateUserSettingsSchema } from '@/modules/settings/settings.schemas';
import { SettingsFinderService } from '@/modules/settings/services/settings-finder.service';
import { SettingsWriterService } from '@/modules/settings/services/settings-writer.service';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { AuthGuard } from '@/shared/guards/auth.guard';

import type { AuthTokenPayload } from '@/modules/auth/types/auth';

@Controller('settings')
export class SettingsController {
  constructor(
    private readonly settingsFinderService: SettingsFinderService,
    private readonly settingsWriterService: SettingsWriterService,
  ) {}

  @UseGuards(AuthGuard)
  @Get()
  async getUserSettings(@CurrentUser() user: AuthTokenPayload) {
    return this.settingsFinderService.getUserSettings(user.sub);
  }

  @UseGuards(AuthGuard)
  @Patch()
  async updateUserSettings(@CurrentUser() user: AuthTokenPayload, @Body() body: unknown) {
    const input = updateUserSettingsSchema.parse(body);

    return this.settingsWriterService.updateUserSettings(user.sub, input);
  }
}