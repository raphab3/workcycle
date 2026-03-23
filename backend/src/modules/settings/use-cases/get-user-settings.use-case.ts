import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';

import { SettingsRepository } from '@/modules/settings/repositories/settings.repository';
import { DEFAULT_USER_SETTINGS_VALUES, toGoogleConnectionSummary } from '@/modules/settings/types/settings';

@Injectable()
export class GetUserSettingsUseCase {
  constructor(
    @Inject(SettingsRepository)
    private readonly settingsRepository: SettingsRepository,
  ) {}

  async execute(userId: string) {
    const googleConnectionRow = await this.settingsRepository.findUserGoogleConnection(userId);

    if (!googleConnectionRow) {
      throw new UnauthorizedException('Authenticated user was not found.');
    }

    let settings = await this.settingsRepository.findUserSettingsByUserId(userId);

    if (!settings) {
      settings = await this.settingsRepository.createUserSettings({
        userId,
        ...DEFAULT_USER_SETTINGS_VALUES,
      });
    }

    return {
      googleConnection: toGoogleConnectionSummary(googleConnectionRow),
      settings,
    };
  }
}