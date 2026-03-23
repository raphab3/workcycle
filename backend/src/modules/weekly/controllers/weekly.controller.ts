import { Controller, Get, Inject, Query, UseGuards } from '@nestjs/common';

import { getWeeklyHistoryQuerySchema, getWeeklySnapshotQuerySchema } from '@/modules/weekly/weekly.schemas';
import { WeeklyFinderService } from '@/modules/weekly/services/weekly-finder.service';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { AuthGuard } from '@/shared/guards/auth.guard';

import type { AuthTokenPayload } from '@/modules/auth/types/auth';

@Controller('weekly')
export class WeeklyController {
  constructor(
    @Inject(WeeklyFinderService)
    private readonly weeklyFinderService: WeeklyFinderService,
  ) {}

  @UseGuards(AuthGuard)
  @Get('snapshots')
  async getSnapshot(@CurrentUser() user: AuthTokenPayload, @Query() query: Record<string, string | undefined>) {
    const input = getWeeklySnapshotQuerySchema.parse(query);

    return this.weeklyFinderService.getWeeklySnapshot(user.sub, input.weekKey);
  }

  @UseGuards(AuthGuard)
  @Get('history')
  async getHistory(@CurrentUser() user: AuthTokenPayload, @Query() query: Record<string, string | undefined>) {
    const input = getWeeklyHistoryQuerySchema.parse(query);

    return this.weeklyFinderService.listWeeklyHistory(user.sub, {
      ...(input.fromWeekKey !== undefined ? { fromWeekKey: input.fromWeekKey } : {}),
      ...(input.limit !== undefined ? { limit: input.limit } : {}),
      ...(input.toWeekKey !== undefined ? { toWeekKey: input.toWeekKey } : {}),
    });
  }
}