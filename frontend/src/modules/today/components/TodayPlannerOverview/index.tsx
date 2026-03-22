'use client';

import { AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import type { Project } from '@/modules/projects/types';
import { getProjectLoadSummary } from '@/modules/tasks/utils/tasks';
import { useActivityPulse } from '@/modules/today/hooks/useActivityPulse';
import type { PulseRecord, TimeBlock, TodayCycleValues } from '@/modules/today/types';
import { buildCloseDayReview, getTimeBlockDurationInMinutes } from '@/modules/today/utils/pulse';
import { buildSuggestedAllocations, formatHours } from '@/modules/today/utils/planner';
import { Button } from '@/shared/components/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/Card';
import { EmptyState } from '@/shared/components/EmptyState';
import { OverlayPanel } from '@/shared/components/OverlayPanel';
import { useWorkspaceStore } from '@/shared/store/useWorkspaceStore';
import { cn } from '@/shared/utils/cn';

import { TodayCycleForm } from '../TodayCycleForm/index';
import { todayPlannerOverviewStyles } from './styles';

type DrawerMode = 'close' | 'review' | null;

function formatClock(timestamp: string | null) {
  if (!timestamp) {
    return '--:--';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp));
}

function formatMinutes(minutes: number) {
  const roundedMinutes = Math.max(0, Math.round(minutes));
  const hours = Math.floor(roundedMinutes / 60);
  const remainingMinutes = roundedMinutes % 60;

  return `${hours}h${String(remainingMinutes).padStart(2, '0')}`;
}

function getCountdownLabel(targetTimestamp: string | null, currentTime: Date) {
  if (!targetTimestamp) {
    return '--';
  }

  const differenceInMinutes = Math.max(0, Math.ceil((new Date(targetTimestamp).getTime() - currentTime.getTime()) / 60_000));

  return `${differenceInMinutes}min`;
}

function buildTrackedHoursByProject(timeBlocks: TimeBlock[], currentTime: Date) {
  return timeBlocks.reduce<Record<string, number>>((hoursByProject, timeBlock) => {
    const trackedHours = getTimeBlockDurationInMinutes(timeBlock, currentTime.toISOString()) / 60;

    return {
      ...hoursByProject,
      [timeBlock.projectId]: Number(((hoursByProject[timeBlock.projectId] ?? 0) + trackedHours).toFixed(1)),
    };
  }, {});
}

function buildConfirmedHoursByProject(timeBlocks: TimeBlock[]) {
  return timeBlocks.reduce<Record<string, number>>((hoursByProject, timeBlock) => ({
    ...hoursByProject,
    [timeBlock.projectId]: Number(((hoursByProject[timeBlock.projectId] ?? 0) + timeBlock.confirmedMinutes / 60).toFixed(1)),
  }), {});
}

function getPendingPulseIndex(pulseHistory: PulseRecord[]) {
  for (let index = pulseHistory.length - 1; index >= 0; index -= 1) {
    if (pulseHistory[index]?.resolution === 'pending') {
      return index;
    }
  }

  return null;
}

function buildDraftActualHours(projects: Project[], trackedHoursByProject: Record<string, number>) {
  return Object.fromEntries(projects.map((project) => [project.id, trackedHoursByProject[project.id] ?? 0]));
}

function getRhythmStatus(realHours: number, plannedHours: number, hasPendingReview: boolean) {
  if (hasPendingReview) {
    return { label: 'Atencao', tone: 'warning' as const };
  }

  if (plannedHours === 0) {
    return { label: 'Sem plano', tone: 'neutral' as const };
  }

  const completionRatio = realHours / plannedHours;

  if (completionRatio > 1.05) {
    return { label: 'Acima do plano', tone: 'danger' as const };
  }

  if (completionRatio >= 0.45) {
    return { label: 'No ritmo', tone: 'positive' as const };
  }

  return { label: 'Atrasado', tone: 'warning' as const };
}

export function TodayPlannerOverview() {
  useActivityPulse();

  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [isPlanExpanded, setIsPlanExpanded] = useState(true);
  const [isProjectPickerOpen, setIsProjectPickerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null);
  const [draftActualHours, setDraftActualHours] = useState<Record<string, number>>({});

  const projects = useWorkspaceStore((state) => state.projects);
  const tasks = useWorkspaceStore((state) => state.tasks);
  const cycleValues = useWorkspaceStore((state) => state.todayCycleValues);
  const todayActualHours = useWorkspaceStore((state) => state.todayActualHours);
  const sessionState = useWorkspaceStore((state) => state.sessionState);
  const sessionStartedAt = useWorkspaceStore((state) => state.sessionStartedAt);
  const activeProjectId = useWorkspaceStore((state) => state.activeProjectId);
  const timeBlocks = useWorkspaceStore((state) => state.timeBlocks);
  const pulseHistory = useWorkspaceStore((state) => state.pulseHistory);
  const activePulse = useWorkspaceStore((state) => state.activePulse);
  const nextPulseDueAt = useWorkspaceStore((state) => state.nextPulseDueAt);
  const regularizationState = useWorkspaceStore((state) => state.regularizationState);
  const closeDayReview = useWorkspaceStore((state) => state.closeDayReview);
  const cycleSnapshot = useWorkspaceStore((state) => state.cycleSnapshot);
  const setTodayCycleValues = useWorkspaceStore((state) => state.setTodayCycleValues);
  const setTodayActualHours = useWorkspaceStore((state) => state.setTodayActualHours);
  const startSession = useWorkspaceStore((state) => state.startSession);
  const pauseSession = useWorkspaceStore((state) => state.pauseSession);
  const resumeSession = useWorkspaceStore((state) => state.resumeSession);
  const switchActiveProject = useWorkspaceStore((state) => state.switchActiveProject);
  const closeDay = useWorkspaceStore((state) => state.closeDay);
  const prepareCloseDayReview = useWorkspaceStore((state) => state.prepareCloseDayReview);
  const openRegularizationPanel = useWorkspaceStore((state) => state.openRegularizationPanel);
  const closeRegularizationPanel = useWorkspaceStore((state) => state.closeRegularizationPanel);
  const reviewPulse = useWorkspaceStore((state) => state.reviewPulse);
  const updateTimeBlock = useWorkspaceStore((state) => state.updateTimeBlock);
  const confirmActivePulse = useWorkspaceStore((state) => state.confirmActivePulse);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 1_000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (sessionState !== 'idle' && sessionState !== 'completed') {
      setIsPlanExpanded(false);
    }
  }, [sessionState]);

  const activeProjects = useMemo(() => projects.filter((project) => project.status === 'active'), [projects]);
  const projectLoadSummary = useMemo(() => getProjectLoadSummary(tasks, activeProjects), [tasks, activeProjects]);
  const allocations = useMemo(
    () => buildSuggestedAllocations(activeProjects, projectLoadSummary, cycleValues),
    [activeProjects, cycleValues, projectLoadSummary],
  );
  const trackedHoursByProject = useMemo(() => buildTrackedHoursByProject(timeBlocks, currentTime), [currentTime, timeBlocks]);
  const confirmedHoursByProject = useMemo(() => buildConfirmedHoursByProject(timeBlocks), [timeBlocks]);
  const allocationMap = useMemo(() => new Map(allocations.map((allocation) => [allocation.projectId, allocation])), [allocations]);
  const activeProject = activeProjects.find((project) => project.id === activeProjectId) ?? null;
  const activeAllocation = activeProjectId ? allocationMap.get(activeProjectId) ?? null : null;
  const totalTrackedHours = Number(Object.values(trackedHoursByProject).reduce((total, value) => total + value, 0).toFixed(1));
  const totalConfirmedHours = Number(Object.values(confirmedHoursByProject).reduce((total, value) => total + value, 0).toFixed(1));
  const totalPlannedHours = Number(allocations.reduce((total, allocation) => total + allocation.plannedHours, 0).toFixed(1));
  const resolvedCloseDayReview = closeDayReview ?? buildCloseDayReview(pulseHistory);
  const rhythmStatus = getRhythmStatus(totalTrackedHours, totalPlannedHours, resolvedCloseDayReview.requiresConfirmation);
  const completedTasksCount = cycleSnapshot?.completedTaskIds.length ?? tasks.filter((task) => task.status === 'done' && task.cycleAssignment === 'current').length;
  const daySummaryHours = sessionState === 'completed'
    ? Number(Object.values(todayActualHours).reduce((total, value) => total + value, 0).toFixed(1))
    : totalTrackedHours;
  const pulseTargetTimestamp = activePulse?.expiresAt ?? nextPulseDueAt;
  const pulseLabel = activePulse ? 'Resposta do pulso' : 'Proximo pulso';
  const activeProjectTrackedHours = activeProjectId ? trackedHoursByProject[activeProjectId] ?? 0 : 0;
  const activeProjectPlannedHours = activeAllocation?.plannedHours ?? 0;

  function handleSubmitCycle(values: TodayCycleValues) {
    setTodayCycleValues(values);
  }

  function handleStartSession() {
    if (!activeProjectId) {
      return;
    }

    startSession(activeProjectId);
    setIsPlanExpanded(false);
  }

  function openDrawer(mode: Exclude<DrawerMode, null>) {
    prepareCloseDayReview();
    setDraftActualHours(buildDraftActualHours(activeProjects, trackedHoursByProject));
    setDrawerMode(mode);

    if (mode === 'review') {
      openRegularizationPanel(getPendingPulseIndex(pulseHistory) ?? undefined);
    }
  }

  function handleCloseDrawer() {
    setDrawerMode(null);
    closeRegularizationPanel();
  }

  function handleConfirmCloseDay() {
    setTodayActualHours(draftActualHours);
    closeDay();
    handleCloseDrawer();
  }

  function handleAdjustDraftHours(projectId: string, delta: number) {
    setDraftActualHours((currentHours) => ({
      ...currentHours,
      [projectId]: Math.max(0, Number(((currentHours[projectId] ?? trackedHoursByProject[projectId] ?? 0) + delta).toFixed(1))),
    }));
  }

  return (
    <div className={todayPlannerOverviewStyles.layout}>
      <section className={todayPlannerOverviewStyles.sessionRail}>
        <Card
          className={cn(
            todayPlannerOverviewStyles.sessionBar,
            sessionState === 'idle' && todayPlannerOverviewStyles.sessionBarIdle,
            sessionState === 'running' && todayPlannerOverviewStyles.sessionBarRunning,
            (sessionState === 'paused_manual' || sessionState === 'paused_inactivity') && todayPlannerOverviewStyles.sessionBarPaused,
            sessionState === 'completed' && todayPlannerOverviewStyles.sessionBarCompleted,
          )}
        >
          <CardContent className={todayPlannerOverviewStyles.sessionBarContent}>
            <div className={todayPlannerOverviewStyles.sessionBarHeader}>
              <div>
                <p className={todayPlannerOverviewStyles.sessionEyebrow}>Sessao de trabalho</p>
                <h2 className={todayPlannerOverviewStyles.sessionTitle}>
                  {sessionState === 'idle' && 'Nenhuma sessao iniciada hoje'}
                  {sessionState === 'running' && 'Sessao em andamento'}
                  {sessionState === 'paused_manual' && 'Sessao pausada manualmente'}
                  {sessionState === 'paused_inactivity' && 'Sessao pausada por inatividade'}
                  {sessionState === 'completed' && 'Dia encerrado'}
                </h2>
                <p className={todayPlannerOverviewStyles.sessionCopy}>
                  {sessionState === 'idle' && 'Confirme o plano do dia, selecione o projeto inicial e comece quando estiver pronto.'}
                  {sessionState === 'running' && `Projeto ativo: ${activeProject?.name ?? 'Sem projeto'} · mantenha a cockpit aberta durante o dia.`}
                  {sessionState === 'paused_manual' && 'A sessao esta pausada. Voce pode retomar quando voltar ao foco ou encerrar o dia.'}
                  {sessionState === 'paused_inactivity' && 'O pulso nao foi respondido no tempo esperado. Revise o intervalo ou retome a sessao.'}
                  {sessionState === 'completed' && `${formatHours(daySummaryHours)} registrados · ${completedTasksCount} task(s) concluidas no ciclo atual.`}
                </p>
              </div>

              {sessionState === 'idle' && (
                <div className={todayPlannerOverviewStyles.sessionIdleActions}>
                  <div className={todayPlannerOverviewStyles.projectPickerRoot}>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsProjectPickerOpen((currentValue) => !currentValue)}
                      aria-expanded={isProjectPickerOpen}
                    >
                      {activeProject?.name ?? 'Selecionar projeto inicial'}
                      <ChevronDown className="ml-2 h-4 w-4" aria-hidden="true" />
                    </Button>

                    {isProjectPickerOpen && (
                      <div className={todayPlannerOverviewStyles.projectPickerMenu}>
                        <p className={todayPlannerOverviewStyles.projectPickerLabel}>Projetos no plano de hoje</p>
                        <div className={todayPlannerOverviewStyles.projectPickerList}>
                          {allocations.map((allocation) => (
                            <button
                              key={allocation.projectId}
                              className={cn(
                                todayPlannerOverviewStyles.projectPickerItem,
                                activeProjectId === allocation.projectId && todayPlannerOverviewStyles.projectPickerItemActive,
                              )}
                              type="button"
                              onClick={() => {
                                switchActiveProject(allocation.projectId);
                                setIsProjectPickerOpen(false);
                              }}
                            >
                              <span aria-hidden="true" className={todayPlannerOverviewStyles.projectDot} style={{ backgroundColor: allocation.colorHex }} />
                              <span className={todayPlannerOverviewStyles.projectPickerInfo}>
                                <span className={todayPlannerOverviewStyles.projectPickerName}>{allocation.projectName}</span>
                                <span className={todayPlannerOverviewStyles.projectPickerMeta}>
                                  Planejado {formatHours(allocation.plannedHours)} · {allocation.kind === 'fixed' ? 'Fixo' : 'Rotativo'}
                                </span>
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <Button type="button" disabled={!activeProjectId} onClick={handleStartSession}>
                    Iniciar sessao
                  </Button>
                </div>
              )}

              {sessionState !== 'idle' && sessionState !== 'completed' && (
                <div className={todayPlannerOverviewStyles.sessionMetrics}>
                  <div className={todayPlannerOverviewStyles.sessionMetric}>
                    <span className={todayPlannerOverviewStyles.sessionMetricLabel}>Inicio</span>
                    <span className={todayPlannerOverviewStyles.sessionMetricValue}>{formatClock(sessionStartedAt)}</span>
                  </div>
                  <div className={todayPlannerOverviewStyles.sessionMetric}>
                    <span className={todayPlannerOverviewStyles.sessionMetricLabel}>Decorrido</span>
                    <span className={todayPlannerOverviewStyles.sessionMetricValue}>
                      {formatMinutes(sessionStartedAt ? Math.round((currentTime.getTime() - new Date(sessionStartedAt).getTime()) / 60_000) : 0)}
                    </span>
                  </div>
                  <div className={todayPlannerOverviewStyles.sessionMetric}>
                    <span className={todayPlannerOverviewStyles.sessionMetricLabel}>{pulseLabel}</span>
                    <span className={todayPlannerOverviewStyles.sessionMetricValue}>{getCountdownLabel(pulseTargetTimestamp, currentTime)}</span>
                  </div>
                </div>
              )}
            </div>

            {sessionState === 'running' && (
              <div className={todayPlannerOverviewStyles.sessionActions}>
                <Button type="button" variant="outline" onClick={() => pauseSession('manual')}>
                  Pausar
                </Button>
                <Button type="button" onClick={() => openDrawer('close')}>
                  Encerrar dia
                </Button>
              </div>
            )}

            {sessionState === 'paused_manual' && (
              <div className={todayPlannerOverviewStyles.sessionActions}>
                <Button type="button" variant="outline" onClick={resumeSession}>
                  Retomar
                </Button>
                <Button type="button" onClick={() => openDrawer('close')}>
                  Encerrar dia
                </Button>
              </div>
            )}

            {sessionState === 'paused_inactivity' && (
              <div className={todayPlannerOverviewStyles.sessionActions}>
                <Button type="button" variant="outline" onClick={resumeSession}>
                  Retomar sessao
                </Button>
                <Button type="button" variant="outline" onClick={() => openDrawer('review')}>
                  Revisar tempo
                </Button>
                <Button type="button" onClick={() => openDrawer('close')}>
                  Encerrar dia
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {activePulse && (
          <Card className={todayPlannerOverviewStyles.pulseBanner}>
            <CardContent className={todayPlannerOverviewStyles.pulseBannerContent}>
              <div>
                <p className={todayPlannerOverviewStyles.pulseBannerEyebrow}>Pulso de atividade</p>
                <h3 className={todayPlannerOverviewStyles.pulseBannerTitle}>Ainda trabalhando? Confirmar atividade</h3>
                <p className={todayPlannerOverviewStyles.pulseBannerCopy}>
                  O pulso atual vence em {getCountdownLabel(activePulse.expiresAt, currentTime)}.
                </p>
              </div>
              <Button type="button" onClick={() => confirmActivePulse()}>
                Confirmar atividade
              </Button>
            </CardContent>
          </Card>
        )}
      </section>

      {allocations.length === 0 ? (
        <EmptyState
          eyebrow="Hoje"
          title="Nao ha frentes suficientes para montar o plano do dia"
          description="Ative projetos para liberar a sessao operacional e permitir a selecao de um projeto inicial."
          hint="O cockpit precisa de pelo menos um projeto ativo para iniciar a sessao."
        />
      ) : (
        <>
          {isPlanExpanded ? (
            <Card>
              <CardHeader className={todayPlannerOverviewStyles.cardHeaderInline}>
                <div>
                  <CardDescription>Plano do dia</CardDescription>
                  <CardTitle>Horas disponiveis e distribuicao recomendada</CardTitle>
                </div>
                {sessionState !== 'idle' && (
                  <Button type="button" variant="ghost" onClick={() => setIsPlanExpanded(false)}>
                    Recolher plano
                    <ChevronUp className="ml-2 h-4 w-4" aria-hidden="true" />
                  </Button>
                )}
              </CardHeader>
              <CardContent className={todayPlannerOverviewStyles.planCardContent}>
                <TodayCycleForm defaultValues={cycleValues} onSubmitCycle={handleSubmitCycle} />
                <div className={todayPlannerOverviewStyles.planList}>
                  {allocations.map((allocation) => (
                    <div key={allocation.projectId} className={todayPlannerOverviewStyles.planItem}>
                      <div className={todayPlannerOverviewStyles.planItemMeta}>
                        <span aria-hidden="true" className={todayPlannerOverviewStyles.projectDot} style={{ backgroundColor: allocation.colorHex }} />
                        <div>
                          <p className={todayPlannerOverviewStyles.planItemTitle}>{allocation.projectName}</p>
                          <p className={todayPlannerOverviewStyles.planItemCopy}>{allocation.reason}</p>
                        </div>
                      </div>
                      <span className={todayPlannerOverviewStyles.planItemHours}>{formatHours(allocation.plannedHours)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className={todayPlannerOverviewStyles.collapsedPlanContent}>
                <div>
                  <p className={todayPlannerOverviewStyles.collapsedPlanEyebrow}>Plano do dia</p>
                  <h3 className={todayPlannerOverviewStyles.collapsedPlanTitle}>{formatHours(totalPlannedHours)} distribuidas em {allocations.length} projeto(s)</h3>
                </div>
                <Button type="button" variant="outline" onClick={() => setIsPlanExpanded(true)}>
                  Rever plano
                  <ChevronDown className="ml-2 h-4 w-4" aria-hidden="true" />
                </Button>
              </CardContent>
            </Card>
          )}

          {sessionState !== 'idle' && activeProject && (
            <Card>
              <CardHeader className={todayPlannerOverviewStyles.cardHeaderInline}>
                <div>
                  <CardDescription>Projeto ativo</CardDescription>
                  <CardTitle>Foco operacional do momento</CardTitle>
                </div>
                <div className={todayPlannerOverviewStyles.projectPickerRoot}>
                  <Button type="button" variant="outline" onClick={() => setIsProjectPickerOpen((currentValue) => !currentValue)}>
                    Trocar projeto
                    <ChevronDown className="ml-2 h-4 w-4" aria-hidden="true" />
                  </Button>

                  {isProjectPickerOpen && (
                    <div className={todayPlannerOverviewStyles.projectPickerMenu}>
                      <p className={todayPlannerOverviewStyles.projectPickerLabel}>Projetos no plano de hoje</p>
                      <div className={todayPlannerOverviewStyles.projectPickerList}>
                        {allocations.map((allocation) => (
                          <button
                            key={allocation.projectId}
                            className={cn(
                              todayPlannerOverviewStyles.projectPickerItem,
                              activeProjectId === allocation.projectId && todayPlannerOverviewStyles.projectPickerItemActive,
                            )}
                            type="button"
                            onClick={() => {
                              switchActiveProject(allocation.projectId);
                              setIsProjectPickerOpen(false);
                            }}
                          >
                            <span aria-hidden="true" className={todayPlannerOverviewStyles.projectDot} style={{ backgroundColor: allocation.colorHex }} />
                            <span className={todayPlannerOverviewStyles.projectPickerInfo}>
                              <span className={todayPlannerOverviewStyles.projectPickerName}>{allocation.projectName}</span>
                              <span className={todayPlannerOverviewStyles.projectPickerMeta}>
                                Planejado {formatHours(allocation.plannedHours)} · Real {formatHours(trackedHoursByProject[allocation.projectId] ?? 0)}
                              </span>
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className={todayPlannerOverviewStyles.activeProjectCard}>
                <div className={todayPlannerOverviewStyles.activeProjectIdentity}>
                  <span aria-hidden="true" className={todayPlannerOverviewStyles.activeProjectDot} style={{ backgroundColor: activeProject.colorHex }} />
                  <div>
                    <p className={todayPlannerOverviewStyles.activeProjectLabel}>Projeto ativo agora</p>
                    <p className={todayPlannerOverviewStyles.activeProjectName}>{activeProject.name}</p>
                  </div>
                </div>
                <p className={todayPlannerOverviewStyles.activeProjectCopy}>
                  Planejado {formatHours(activeProjectPlannedHours)} · Real {formatHours(activeProjectTrackedHours)}
                </p>
              </CardContent>
            </Card>
          )}

          {sessionState !== 'idle' && (
            <section className={todayPlannerOverviewStyles.progressGrid} aria-label="Resumo do progresso do dia">
              <Card>
                <CardHeader className={todayPlannerOverviewStyles.progressCardHeader}>
                  <CardDescription>Progresso do dia</CardDescription>
                  <CardTitle>{formatHours(totalTrackedHours)} / {formatHours(totalPlannedHours)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={todayPlannerOverviewStyles.progressBarTrack}>
                    <div className={todayPlannerOverviewStyles.progressBarFill} style={{ width: `${Math.min((totalTrackedHours / Math.max(totalPlannedHours, 1)) * 100, 100)}%` }} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className={todayPlannerOverviewStyles.progressCardHeader}>
                  <CardDescription>Projeto ativo</CardDescription>
                  <CardTitle>{formatHours(activeProjectTrackedHours)} / {formatHours(activeProjectPlannedHours)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={todayPlannerOverviewStyles.progressBarTrack}>
                    <div className={todayPlannerOverviewStyles.progressBarFillProject} style={{ width: `${Math.min((activeProjectTrackedHours / Math.max(activeProjectPlannedHours, 1)) * 100, 100)}%` }} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className={todayPlannerOverviewStyles.progressCardHeader}>
                  <CardDescription>Ritmo</CardDescription>
                  <CardTitle
                    className={cn(
                      rhythmStatus.tone === 'positive' && todayPlannerOverviewStyles.positiveText,
                      rhythmStatus.tone === 'warning' && todayPlannerOverviewStyles.warningText,
                      rhythmStatus.tone === 'danger' && todayPlannerOverviewStyles.dangerText,
                    )}
                  >
                    {rhythmStatus.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={todayPlannerOverviewStyles.progressMetaList}>
                    <span>Saldo do dia: {formatHours(Math.max(totalPlannedHours - totalTrackedHours, 0))}</span>
                    <span>Confirmado: {formatHours(totalConfirmedHours)}</span>
                  </div>
                </CardContent>
              </Card>
            </section>
          )}
        </>
      )}

      <OverlayPanel
        isOpen={drawerMode !== null}
        onClose={handleCloseDrawer}
        title={drawerMode === 'review' ? 'Revisar tempo' : 'Encerrar dia'}
        description={drawerMode === 'review'
          ? 'Regularize pulsos sem resposta e ajuste os blocos de tempo antes de retomar ou fechar o ciclo.'
          : 'Revise os blocos do dia, ajuste as horas finais e confirme o encerramento do ciclo.'}
      >
        <div className={todayPlannerOverviewStyles.drawerStack}>
          {resolvedCloseDayReview.requiresConfirmation && (
            <div className={todayPlannerOverviewStyles.reviewNotice}>
              <AlertTriangle className="h-4.5 w-4.5" aria-hidden="true" />
              <p>{resolvedCloseDayReview.message}</p>
            </div>
          )}

          <section className={todayPlannerOverviewStyles.drawerSection}>
            <div className={todayPlannerOverviewStyles.drawerSectionHeader}>
              <h3 className={todayPlannerOverviewStyles.drawerSectionTitle}>Linha do tempo de pulsos</h3>
              <p className={todayPlannerOverviewStyles.drawerSectionCopy}>Confirme ou marque como inativo qualquer intervalo ainda pendente.</p>
            </div>
            <div className={todayPlannerOverviewStyles.drawerList}>
              {pulseHistory.length === 0 ? (
                <p className={todayPlannerOverviewStyles.drawerEmptyCopy}>Nenhum pulso registrado ainda nesta sessao.</p>
              ) : (
                pulseHistory.map((pulse, index) => (
                  <div
                    key={`${pulse.firedAt}-${index}`}
                    className={cn(
                      todayPlannerOverviewStyles.pulseItem,
                      regularizationState.highlightedPulseIndex === index && todayPlannerOverviewStyles.pulseItemHighlighted,
                    )}
                  >
                    <div>
                      <p className={todayPlannerOverviewStyles.pulseItemTitle}>{formatClock(pulse.firedAt)} · {pulse.projectId ? allocationMap.get(pulse.projectId)?.projectName ?? pulse.projectId : 'Sem projeto'}</p>
                      <p className={todayPlannerOverviewStyles.pulseItemCopy}>
                        {pulse.status === 'confirmed' ? 'Pulso confirmado.' : pulse.resolution === 'inactive' ? 'Intervalo marcado como inativo.' : 'Intervalo ainda sem revisao.'}
                      </p>
                    </div>
                    {pulse.resolution === 'pending' ? (
                      <div className={todayPlannerOverviewStyles.pulseActions}>
                        <Button type="button" size="sm" variant="outline" onClick={() => reviewPulse(index, 'inactive')}>
                          Marcar inativa
                        </Button>
                        <Button type="button" size="sm" onClick={() => reviewPulse(index, 'confirmed')}>
                          Confirmar janela
                        </Button>
                      </div>
                    ) : (
                      <span className={todayPlannerOverviewStyles.pulseResolutionBadge}>
                        {pulse.resolution === 'confirmed' ? 'Confirmado' : 'Inativo'}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>

          <section className={todayPlannerOverviewStyles.drawerSection}>
            <div className={todayPlannerOverviewStyles.drawerSectionHeader}>
              <h3 className={todayPlannerOverviewStyles.drawerSectionTitle}>Blocos de tempo</h3>
              <p className={todayPlannerOverviewStyles.drawerSectionCopy}>Revise projeto, duracao total e minutos confiaveis registrados em cada bloco.</p>
            </div>
            <div className={todayPlannerOverviewStyles.drawerList}>
              {timeBlocks.map((timeBlock, index) => {
                const trackedMinutes = getTimeBlockDurationInMinutes(timeBlock, currentTime.toISOString());
                const unconfirmedMinutes = Math.max(0, trackedMinutes - timeBlock.confirmedMinutes);

                return (
                  <div key={`${timeBlock.projectId}-${timeBlock.startedAt}-${index}`} className={todayPlannerOverviewStyles.timeBlockItem}>
                    <div className={todayPlannerOverviewStyles.timeBlockTop}>
                      <select
                        aria-label={`Projeto do bloco ${index + 1}`}
                        className={todayPlannerOverviewStyles.timeBlockSelect}
                        value={timeBlock.projectId}
                        onChange={(event) => updateTimeBlock(index, { projectId: event.target.value })}
                      >
                        {allocations.map((allocation) => (
                          <option key={allocation.projectId} value={allocation.projectId}>{allocation.projectName}</option>
                        ))}
                      </select>
                      <span className={todayPlannerOverviewStyles.timeBlockWindow}>{formatClock(timeBlock.startedAt)} - {formatClock(timeBlock.endedAt ?? currentTime.toISOString())}</span>
                    </div>
                    <div className={todayPlannerOverviewStyles.timeBlockMetrics}>
                      <span>Total {formatMinutes(trackedMinutes)}</span>
                      <span>Confirmado {formatMinutes(timeBlock.confirmedMinutes)}</span>
                      <span>Nao confirmado {formatMinutes(unconfirmedMinutes)}</span>
                    </div>
                    <div className={todayPlannerOverviewStyles.timeBlockActions}>
                      <Button type="button" size="sm" variant="outline" onClick={() => updateTimeBlock(index, { confirmedMinutes: Math.max(0, timeBlock.confirmedMinutes - 15) })}>
                        -15min
                      </Button>
                      <Button type="button" size="sm" variant="outline" onClick={() => updateTimeBlock(index, { confirmedMinutes: Math.min(trackedMinutes, timeBlock.confirmedMinutes + 15) })}>
                        +15min
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className={todayPlannerOverviewStyles.drawerSection}>
            <div className={todayPlannerOverviewStyles.drawerSectionHeader}>
              <h3 className={todayPlannerOverviewStyles.drawerSectionTitle}>Fechamento com horas finais</h3>
              <p className={todayPlannerOverviewStyles.drawerSectionCopy}>Use os ajustes finais para consolidar o que sera salvo no resumo do dia.</p>
            </div>
            <div className={todayPlannerOverviewStyles.drawerList}>
              {allocations.map((allocation) => (
                <div key={allocation.projectId} className={todayPlannerOverviewStyles.finalHoursItem}>
                  <div>
                    <p className={todayPlannerOverviewStyles.finalHoursTitle}>{allocation.projectName}</p>
                    <p className={todayPlannerOverviewStyles.finalHoursCopy}>Planejado {formatHours(allocation.plannedHours)} · Real atual {formatHours(trackedHoursByProject[allocation.projectId] ?? 0)}</p>
                  </div>
                  <div className={todayPlannerOverviewStyles.finalHoursActions}>
                    <Button type="button" size="sm" variant="outline" onClick={() => handleAdjustDraftHours(allocation.projectId, -0.5)}>
                      -0.5h
                    </Button>
                    <span className={todayPlannerOverviewStyles.finalHoursValue}>{formatHours(draftActualHours[allocation.projectId] ?? trackedHoursByProject[allocation.projectId] ?? 0)}</span>
                    <Button type="button" size="sm" variant="outline" onClick={() => handleAdjustDraftHours(allocation.projectId, 0.5)}>
                      +0.5h
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {drawerMode === 'close' && (
            <div className={todayPlannerOverviewStyles.drawerFooter}>
              <div className={todayPlannerOverviewStyles.drawerSummary}>
                <div className={todayPlannerOverviewStyles.drawerSummaryItem}>
                  <span>Horas registradas</span>
                  <strong>{formatHours(Number(Object.values(draftActualHours).reduce((total, value) => total + value, 0).toFixed(1)))}</strong>
                </div>
                <div className={todayPlannerOverviewStyles.drawerSummaryItem}>
                  <span>Tasks concluidas</span>
                  <strong>{completedTasksCount}</strong>
                </div>
              </div>
              <Button type="button" onClick={handleConfirmCloseDay}>
                Confirmar encerramento
              </Button>
            </div>
          )}
        </div>
      </OverlayPanel>
    </div>
  );
}