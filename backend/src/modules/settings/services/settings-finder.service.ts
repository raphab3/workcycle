import { Inject, Injectable } from '@nestjs/common';

import { GetUserSettingsUseCase } from '@/modules/settings/use-cases/get-user-settings.use-case';
import { toUserSettingsDTO } from '@/modules/settings/types/settings';

@Injectable()
export class SettingsFinderService {
  constructor(
    @Inject(GetUserSettingsUseCase)
    private readonly getUserSettingsUseCase: GetUserSettingsUseCase,
  ) {}

  async getUserSettings(userId: string) {
    const aggregate = await this.getUserSettingsUseCase.execute(userId);

    return toUserSettingsDTO(aggregate.settings, aggregate.googleConnection);
  }
}