import { Inject, Injectable } from '@nestjs/common';

import { SettingsFinderService } from '@/modules/settings/services/settings-finder.service';
import { WeeklyRepository } from '@/modules/weekly/repositories/weekly.repository';
import { buildWeeklySnapshotForWeek, resolveCurrentCycleDate } from '@/modules/weekly/use-cases/shared-weekly';
import { getPreviousWeekKey, getWeekInfoFromDate, listWeekKeysInRange } from '@/modules/weekly/utils/weekly-boundary';

import type { WeeklyHistoryResponseDTO } from '@/modules/weekly/types/weekly';

@Injectable()
export class ListWeeklyHistoryUseCase {
  constructor(
    @Inject(WeeklyRepository)
    private readonly weeklyRepository: WeeklyRepository,
    @Inject(SettingsFinderService)
    private readonly settingsFinderService: SettingsFinderService,
  ) {}

  async execute(userId: string, options?: { fromWeekKey?: string; limit?: number; toWeekKey?: string }): Promise<WeeklyHistoryResponseDTO> {
    const settings = await this.settingsFinderService.getUserSettings(userId);
    const generatedAt = new Date().toISOString();
    const currentCycleDate = resolveCurrentCycleDate(generatedAt, settings);
    const currentWeekKey = getWeekInfoFromDate(currentCycleDate).weekKey;
    const toWeekKey = options?.toWeekKey ?? getPreviousWeekKey(currentWeekKey, 1);
    const fromWeekKey = options?.fromWeekKey ?? getPreviousWeekKey(toWeekKey, Math.max((options?.limit ?? 8) - 1, 0));
    const requestedWeekKeys = listWeekKeysInRange(fromWeekKey, toWeekKey).filter((weekKey) => weekKey < currentWeekKey);
    const persistedSnapshots = await this.weeklyRepository.listWeeklySnapshots(userId, {
      fromWeekKey,
      limit: options?.limit,
      toWeekKey,
    });
    const persistedMap = new Map(persistedSnapshots.map((snapshot) => [snapshot.weekKey, snapshot.snapshot]));
    const snapshots = [];

    for (const weekKey of requestedWeekKeys) {
      const persistedSnapshot = persistedMap.get(weekKey);

      if (persistedSnapshot) {
        snapshots.push(persistedSnapshot);
        continue;
      }

      const snapshot = await buildWeeklySnapshotForWeek({
        currentCycleDate,
        generatedAt,
        repository: this.weeklyRepository,
        timezone: settings.timezone,
        userId,
        weekKey,
      });

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
      snapshots.push(snapshot);
    }

    return {
      snapshots: snapshots.sort((left, right) => right.weekKey.localeCompare(left.weekKey)).slice(0, options?.limit ?? 8),
    };
  }
}