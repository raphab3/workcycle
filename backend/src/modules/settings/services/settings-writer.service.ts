import { Inject, Injectable } from '@nestjs/common';

import { UpdateUserSettingsUseCase } from '@/modules/settings/use-cases/update-user-settings.use-case';
import { toGoogleConnectionSummary, toUserSettingsDTO } from '@/modules/settings/types/settings';

import type { UpdateUserSettingsInput } from '@/modules/settings/types/settings';

@Injectable()
export class SettingsWriterService {
  constructor(
    @Inject(UpdateUserSettingsUseCase)
    private readonly updateUserSettingsUseCase: UpdateUserSettingsUseCase,
  ) {}

  async updateUserSettings(userId: string, input: UpdateUserSettingsInput) {
    const aggregate = await this.updateUserSettingsUseCase.execute(userId, input);

    return toUserSettingsDTO(aggregate.settings, toGoogleConnectionSummary(aggregate.googleConnection));
  }
}