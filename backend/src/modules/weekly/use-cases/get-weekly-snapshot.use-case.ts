import { Inject, Injectable } from '@nestjs/common';

import { SettingsFinderService } from '@/modules/settings/services/settings-finder.service';
import { WeeklyRepository } from '@/modules/weekly/repositories/weekly.repository';
import { buildWeeklySnapshotForWeek, resolveCurrentCycleDate } from '@/modules/weekly/use-cases/shared-weekly';
import { getWeekInfoFromDate } from '@/modules/weekly/utils/weekly-boundary';

@Injectable()
export class GetWeeklySnapshotUseCase {
  constructor(
    @Inject(WeeklyRepository)
    private readonly weeklyRepository: WeeklyRepository,
    @Inject(SettingsFinderService)
    private readonly settingsFinderService: SettingsFinderService,
  ) {}

  async execute(userId: string, weekKey?: string) {
    const settings = await this.settingsFinderService.getUserSettings(userId);
    const generatedAt = new Date().toISOString();
    const currentCycleDate = resolveCurrentCycleDate(generatedAt, settings);
    const resolvedWeekKey = weekKey ?? getWeekInfoFromDate(currentCycleDate).weekKey;
    const currentWeekKey = getWeekInfoFromDate(currentCycleDate).weekKey;

    if (resolvedWeekKey < currentWeekKey) {
      const persistedSnapshot = await this.weeklyRepository.findWeeklySnapshot(userId, resolvedWeekKey);

      if (persistedSnapshot) {
        return persistedSnapshot.snapshot;
      }
    }

    const snapshot = await buildWeeklySnapshotForWeek({
      currentCycleDate,
      generatedAt,
      repository: this.weeklyRepository,
      timezone: settings.timezone,
      userId,
      weekKey: resolvedWeekKey,
    });

    if (snapshot.isFinal) {
      await this.weeklyRepository.upsertWeeklySnapshot({
        generatedAt: new Date(snapshot.generatedAt),
        isFinal: true,
        snapshot,
        timezone: snapshot.timezone,
        userId,
        weekEndsAt: snapshot.weekEndsAt,
        weekKey: snapshot.weekKey,
        weekStartsAt: snapshot.weekStartsAt,
      });
    }

    return snapshot;
  }
}