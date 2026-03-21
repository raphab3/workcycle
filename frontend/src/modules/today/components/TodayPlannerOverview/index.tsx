'use client';

import { AlertTriangle, CalendarClock, Gauge } from 'lucide-react';
import { useMemo } from 'react';

import { getProjectLoadSummary } from '@/modules/tasks/utils/tasks';
import type { TodayCycleValues } from '@/modules/today/types';
import { buildTodayOperationalContext } from '@/modules/today/utils/context';
import { buildSuggestedAllocations, createActualHoursMap, formatHours, formatPlanningMoment, mergeActualHoursWithAllocations } from '@/modules/today/utils/planner';
import { cn } from '@/shared/utils/cn';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/Card';
import { EmptyState } from '@/shared/components/EmptyState';
import { SectionIntro } from '@/shared/components/SectionIntro';
import { StateNotice } from '@/shared/components/StateNotice';
import { useWorkspaceStore } from '@/shared/store/useWorkspaceStore';

import { ExecutionAdjuster } from '../ExecutionAdjuster/index';
import { SuggestionBanner } from '../SuggestionBanner/index';
import { TodayCycleForm } from '../TodayCycleForm/index';
import { todayPlannerOverviewStyles } from './styles';

export function TodayPlannerOverview() {
  const projects = useWorkspaceStore((state) => state.projects);
  const tasks = useWorkspaceStore((state) => state.tasks);
  const cycleValues = useWorkspaceStore((state) => state.todayCycleValues);
  const storedActualHours = useWorkspaceStore((state) => state.todayActualHours);
  const setTodayCycleValues = useWorkspaceStore((state) => state.setTodayCycleValues);
  const setTodayActualHours = useWorkspaceStore((state) => state.setTodayActualHours);
  const activeProjects = useMemo(() => projects.filter((project) => project.status === 'active'), [projects]);
  const projectLoadSummary = useMemo(() => getProjectLoadSummary(tasks, activeProjects), [tasks, activeProjects]);
  const allocations = useMemo(
    () => buildSuggestedAllocations(activeProjects, projectLoadSummary, cycleValues),
    [activeProjects, projectLoadSummary, cycleValues],
  );
  const actualHours = useMemo(() => mergeActualHoursWithAllocations(storedActualHours, allocations), [storedActualHours, allocations]);
  const operationalContext = buildTodayOperationalContext({
    projects,
    tasks,
    allocations,
    actualHours,
    projectLoadSummary,
  });

  const summary = [
    {
      label: 'Horas no dia',
      value: `${formatHours(operationalContext.actualTodayHours)} / ${formatHours(operationalContext.plannedTodayHours)}`,
      icon: CalendarClock,
    },
    { label: 'Carga aberta', value: formatHours(operationalContext.openEffortHours), icon: Gauge },
    {
      label: 'Risco imediato',
      value: `${operationalContext.overdueTasksCount + operationalContext.dueTodayTasksCount + operationalContext.blockedTasksCount} sinais`,
      icon: AlertTriangle,
    },
  ];

  function handleSubmitCycle(values: TodayCycleValues) {
    const nextAllocations = buildSuggestedAllocations(activeProjects, projectLoadSummary, values);

    setTodayCycleValues(values);
    setTodayActualHours(createActualHoursMap(nextAllocations));
  }

  function handleAdjustHours(projectId: string, delta: number) {
    setTodayActualHours({
      ...actualHours,
      [projectId]: Math.max(0, Number(((actualHours[projectId] ?? 0) + delta).toFixed(1))),
    });
  }

  return (
    <div className={todayPlannerOverviewStyles.layout}>
      <div className={todayPlannerOverviewStyles.stack}>
        <SectionIntro
          eyebrow="Hoje"
          title="Contexto do ciclo a partir do que esta acontecendo hoje"
          description="A tela Hoje usa a escala montada para ler ritmo, carga futura e risco operacional antes de redistribuir horas e fechar o dia."
        />
        <p className={todayPlannerOverviewStyles.planningMoment}>Momento atual do plano · {formatPlanningMoment(new Date())}</p>
        <div className={todayPlannerOverviewStyles.contextSignals}>
          {operationalContext.contextSignals.map((signal) => (
            <span key={signal} className={todayPlannerOverviewStyles.contextSignal}>
              {signal}
            </span>
          ))}
        </div>

        <div className={todayPlannerOverviewStyles.contextGrid}>
          {operationalContext.cards.map((card) => (
            <Card
              key={card.id}
              className={cn(
                todayPlannerOverviewStyles.contextCard,
                card.tone === 'positive' && todayPlannerOverviewStyles.contextCardPositive,
                card.tone === 'warning' && todayPlannerOverviewStyles.contextCardWarning,
                card.tone === 'danger' && todayPlannerOverviewStyles.contextCardDanger,
              )}
            >
              <CardHeader>
                <CardDescription>{card.eyebrow}</CardDescription>
                <CardTitle>{card.title}</CardTitle>
              </CardHeader>
              <CardContent className={todayPlannerOverviewStyles.contextCardContent}>
                <p className={todayPlannerOverviewStyles.contextCardCopy}>{card.description}</p>
                <div className={todayPlannerOverviewStyles.contextHighlights}>
                  {card.highlights.map((highlight) => (
                    <span key={highlight} className={todayPlannerOverviewStyles.contextHighlight}>
                      {highlight}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {allocations.length === 0 && (
          <EmptyState
            eyebrow="Hoje"
            title="Nao ha frentes suficientes para montar a escala"
            description="Ative projetos e distribua a carteira para liberar o planejamento diario do mock."
            hint="Este estado protege a tela quando a base de projetos ou tasks estiver vazia."
          />
        )}

        <div className={todayPlannerOverviewStyles.summaryGrid}>
          {summary.map((item) => {
            const Icon = item.icon;

            return (
              <Card key={item.label}>
                <CardHeader>
                  <CardDescription>{item.label}</CardDescription>
                  <CardTitle className="flex items-center justify-between gap-3">
                    <span className={todayPlannerOverviewStyles.metricValue}>{item.value}</span>
                    <Icon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                  </CardTitle>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        <StateNotice
          eyebrow="Estado transversal"
          title="Plano do dia sincronizado com Projetos e Tarefas"
          description="A leitura operacional agora reage ao que foi editado nas outras rotas do workspace durante a mesma sessao."
          tone="info"
        />

        <Card>
          <CardHeader>
            <CardDescription>Configurar ciclo</CardDescription>
            <CardTitle>Horas disponiveis e numero de projetos no dia</CardTitle>
          </CardHeader>
          <CardContent>
            <TodayCycleForm defaultValues={cycleValues} onSubmitCycle={handleSubmitCycle} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Escala sugerida</CardDescription>
            <CardTitle>Distribuicao inicial do dia</CardTitle>
          </CardHeader>
          <CardContent className={todayPlannerOverviewStyles.plannerList}>
            {allocations.map((item) => (
              <div key={item.projectId} className={todayPlannerOverviewStyles.plannerItem}>
                <div className={todayPlannerOverviewStyles.plannerTop}>
                  <div>
                    <p className={todayPlannerOverviewStyles.plannerTitle}>{item.projectName}</p>
                    <p className={todayPlannerOverviewStyles.plannerMeta}>{item.reason}</p>
                  </div>
                  <span className={todayPlannerOverviewStyles.plannerHours}>{formatHours(item.plannedHours)}</span>
                </div>
                <div className={todayPlannerOverviewStyles.plannerBadges}>
                  <span className={`${todayPlannerOverviewStyles.plannerBadge} ${item.kind === 'fixed' ? todayPlannerOverviewStyles.plannerBadgeFixed : todayPlannerOverviewStyles.plannerBadgeRotative}`}>
                    {item.kind === 'fixed' ? 'Fixo' : 'Rotativo'}
                  </span>
                  <span className={`${todayPlannerOverviewStyles.plannerBadge} ${todayPlannerOverviewStyles.plannerBadgeRotative}`}>
                    {item.currentAllocationPct}% atual → {item.suggestedAllocationPct}% sugerido
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className={todayPlannerOverviewStyles.sideStack}>
        <SuggestionBanner allocations={allocations} planningMoment={formatPlanningMoment(new Date())} />

        <Card>
          <CardHeader>
            <CardDescription>Ajuste manual</CardDescription>
            <CardTitle>Fechamento do dia com horas reais</CardTitle>
          </CardHeader>
          <CardContent>
            <ExecutionAdjuster allocations={allocations} actualHours={actualHours} availableHours={cycleValues.availableHours} onAdjustHours={handleAdjustHours} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Resumo de carga vindo das tarefas</CardDescription>
            <CardTitle>Base para a priorizacao da escala e do contexto</CardTitle>
          </CardHeader>
          <CardContent className={todayPlannerOverviewStyles.projectLoadList}>
            {projectLoadSummary.map((item) => (
              <div key={item.projectId} className={todayPlannerOverviewStyles.projectLoadItem}>
                <div className={todayPlannerOverviewStyles.projectLoadMeta}>
                  <span aria-hidden="true" className={todayPlannerOverviewStyles.projectColor} style={{ backgroundColor: item.colorHex }} />
                  <div>
                    <p className={todayPlannerOverviewStyles.projectName}>{item.projectName}</p>
                    <p className={todayPlannerOverviewStyles.projectCopy}>{item.openTasks} task(s) abertas</p>
                  </div>
                </div>
                <p className={todayPlannerOverviewStyles.projectName}>{formatHours(item.effortHours)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}