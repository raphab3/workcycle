import { Inject, Injectable } from '@nestjs/common';

import { CycleRepository } from '@/modules/cycle/repositories/cycle.repository';
import { buildOperationalBoundary, resolveOperationalCycleDate } from '@/modules/cycle/utils/operational-boundary';
import { buildTodaySessionDTO, syncConfirmedMinutes, toTodayPulseRecordDTO, toTodayTimeBlockDTO } from '@/modules/cycle/use-cases/shared-today-session';
import { SettingsFinderService } from '@/modules/settings/services/settings-finder.service';

@Injectable()
export class GetTodaySessionUseCase {
  constructor(
    @Inject(CycleRepository)
    private readonly cycleRepository: CycleRepository,
    @Inject(SettingsFinderService)
    private readonly settingsFinderService: SettingsFinderService,
  ) {}

  async execute(userId: string, cycleDate?: string) {
    const settings = await this.settingsFinderService.getUserSettings(userId);
    const effectiveCycleDate = cycleDate ?? resolveOperationalCycleDate(new Date(), {
      cycleStartHour: settings.cycleStartHour,
      timezone: settings.timezone,
    });

    let session = await this.cycleRepository.findCycleSessionByDate(userId, effectiveCycleDate);
    const latestSession = await this.cycleRepository.findLatestCycleSession(userId);

    if (!session && latestSession && latestSession.cycleDate < effectiveCycleDate && latestSession.state !== 'completed') {
      const previousTasks = await this.cycleRepository.listTasksForCycleSession(userId, latestSession.id);
      const previousPulseRows = await this.cycleRepository.listPulseRecords(latestSession.id);
      const previousTimeBlockRows = await this.cycleRepository.listTimeBlocks(latestSession.id);
      const syncedPreviousTimeBlocks = syncConfirmedMinutes(previousTimeBlockRows.map(toTodayTimeBlockDTO), previousPulseRows.map(toTodayPulseRecordDTO));
      const carryOverTaskIds = previousTasks
        .filter((task) => task.cycleAssignment === 'current' && task.status !== 'done' && task.isArchived === false)
        .map((task) => task.id);
      const boundary = buildOperationalBoundary(effectiveCycleDate, {
        cycleStartHour: settings.cycleStartHour,
        timezone: settings.timezone,
      });

      await this.cycleRepository.updateCycleSession(latestSession.id, userId, {
        closedAt: new Date(boundary.boundaryStartsAt),
        snapshot: latestSession.snapshot ?? {
          actualHours: Math.round((syncedPreviousTimeBlocks.reduce((total, block) => total + block.confirmedMinutes, 0) / 60) * 10) / 10,
          completedTaskIds: previousTasks.filter((task) => task.cycleAssignment === 'current' && task.status === 'done').map((task) => task.id),
          incompleteTaskIds: carryOverTaskIds,
          plannedHours: 0,
        },
        state: 'completed',
      });

      if (carryOverTaskIds.length > 0) {
        await this.cycleRepository.moveCurrentTasksToNextCycle(userId, latestSession.id, carryOverTaskIds);
      }
    }

    if (!session) {
      session = await this.cycleRepository.createCycleSession({
        cycleDate: effectiveCycleDate,
        previousCycleDate: latestSession?.cycleDate && latestSession.cycleDate < effectiveCycleDate ? latestSession.cycleDate : null,
        rolloverNoticeDescription: latestSession?.cycleDate && latestSession.cycleDate < effectiveCycleDate
          ? 'Voce ja esta no novo dia. O ciclo anterior foi encerrado automaticamente e os itens em andamento ficaram disponiveis para retomada.'
          : null,
        rolloverNoticeTitle: latestSession?.cycleDate && latestSession.cycleDate < effectiveCycleDate
          ? 'Novo dia preparado automaticamente'
          : null,
        rolloverStrategy: 'manual-start-next',
        rolloverTriggeredAt: latestSession?.cycleDate && latestSession.cycleDate < effectiveCycleDate
          ? new Date(buildOperationalBoundary(effectiveCycleDate, {
            cycleStartHour: settings.cycleStartHour,
            timezone: settings.timezone,
          }).boundaryStartsAt)
          : null,
        state: 'idle',
        userId,
      });
    }

    const pulseRows = await this.cycleRepository.listPulseRecords(session.id);
    const timeBlockRows = await this.cycleRepository.listTimeBlocks(session.id);
    const taskRows = await this.cycleRepository.listTasksForTaskScope(userId, session.id);

    return buildTodaySessionDTO({
      pulseRows,
      referenceAt: new Date().toISOString(),
      session,
      settings,
      taskRows,
      timeBlockRows,
    });
  }
}