import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';

import { SettingsRepository } from '@/modules/settings/repositories/settings.repository';

import type { UpdateUserSettingsInput } from '@/modules/settings/settings.schemas';

@Injectable()
export class UpdateUserSettingsUseCase {
  constructor(
    @Inject(SettingsRepository)
    private readonly settingsRepository: SettingsRepository,
  ) {}

  async execute(userId: string, input: UpdateUserSettingsInput) {
    const googleConnectionRow = await this.settingsRepository.findUserGoogleConnection(userId);

    if (!googleConnectionRow) {
      throw new UnauthorizedException('Authenticated user was not found.');
    }

    const settings = await this.settingsRepository.upsertUserSettings(userId, input);

    return {
      googleConnection: googleConnectionRow,
      settings,
    };
  }
}