import { Body, Controller, Get, Inject, Patch, Post, Query, UseGuards } from '@nestjs/common';

import { getTodaySessionQuerySchema, listPulseRecordsQuerySchema, updateTodaySessionSchema, upsertPulseRecordSchema } from '@/modules/cycle/cycle.schemas';
import { CycleFinderService } from '@/modules/cycle/services/cycle-finder.service';
import { CycleWriterService } from '@/modules/cycle/services/cycle-writer.service';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { AuthGuard } from '@/shared/guards/auth.guard';

import type { AuthTokenPayload } from '@/modules/auth/types/auth';

@Controller('cycle')
export class CycleController {
  constructor(
    @Inject(CycleFinderService)
    private readonly cycleFinderService: CycleFinderService,
    @Inject(CycleWriterService)
    private readonly cycleWriterService: CycleWriterService,
  ) {}

  @Get('status')
  getStatus() {
    return this.cycleFinderService.getStatus();
  }

  @UseGuards(AuthGuard)
  @Get('session')
  async getSession(@CurrentUser() user: AuthTokenPayload, @Query() query: Record<string, string | undefined>) {
    const input = getTodaySessionQuerySchema.parse(query);

    return this.cycleFinderService.getTodaySession(user.sub, input.cycleDate);
  }

  @UseGuards(AuthGuard)
  @Patch('session')
  async updateSession(@CurrentUser() user: AuthTokenPayload, @Body() body: unknown) {
    const input = updateTodaySessionSchema.parse(body);

    return this.cycleWriterService.updateTodaySession(user.sub, input);
  }

  @UseGuards(AuthGuard)
  @Post('pulse')
  async recordPulse(@CurrentUser() user: AuthTokenPayload, @Body() body: unknown) {
    const input = upsertPulseRecordSchema.parse(body);

    return this.cycleWriterService.upsertPulseRecord(user.sub, input);
  }

  @UseGuards(AuthGuard)
  @Get('pulse-records')
  async listPulseRecords(@CurrentUser() user: AuthTokenPayload, @Query() query: Record<string, string | undefined>) {
    const input = listPulseRecordsQuerySchema.parse(query);

    return this.cycleFinderService.listPulseRecords(user.sub, input);
  }
}