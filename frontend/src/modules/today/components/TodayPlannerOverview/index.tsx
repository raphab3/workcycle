'use client';

import { CalendarClock, Gauge, Sigma } from 'lucide-react';
import { useState } from 'react';

import { mockProjects } from '@/modules/projects/mocks/projects';
import { mockTasks } from '@/modules/tasks/mocks/tasks';
import { getProjectLoadSummary, getUrgentTasksCount } from '@/modules/tasks/utils/tasks';
import type { TodayCycleValues } from '@/modules/today/types';
import { buildSuggestedAllocations, createActualHoursMap, formatHours, formatPlanningMoment } from '@/modules/today/utils/planner';

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

import { ExecutionAdjuster } from '../ExecutionAdjuster/index';
import { SuggestionBanner } from '../SuggestionBanner/index';
import { TodayCycleForm } from '../TodayCycleForm/index';
import { todayPlannerOverviewStyles } from './styles';

const activeProjects = mockProjects.filter((project) => project.status === 'active');
const projectLoadSummary = getProjectLoadSummary(mockTasks, activeProjects);
const defaultCycleValues: TodayCycleValues = {
  availableHours: 10,
  projectsInCycle: Math.min(activeProjects.length, 3),
};
const defaultAllocations = buildSuggestedAllocations(activeProjects, projectLoadSummary, defaultCycleValues);

export function TodayPlannerOverview() {
  const [cycleValues, setCycleValues] = useState<TodayCycleValues>(defaultCycleValues);
  const [allocations, setAllocations] = useState(defaultAllocations);
  const [actualHours, setActualHours] = useState<Record<string, number>>(createActualHoursMap(defaultAllocations));

  const summary = [
    { label: 'Horas disponiveis', value: `${cycleValues.availableHours}h`, icon: CalendarClock },
    { label: 'Projetos no ciclo', value: `${allocations.length}`, icon: Sigma },
    { label: 'Tasks urgentes', value: `${getUrgentTasksCount(mockTasks)}`, icon: Gauge },
  ];

  function handleSubmitCycle(values: TodayCycleValues) {
    const nextAllocations = buildSuggestedAllocations(activeProjects, projectLoadSummary, values);

    setCycleValues(values);
    setAllocations(nextAllocations);
    setActualHours(createActualHoursMap(nextAllocations));
  }

  function handleAdjustHours(projectId: string, delta: number) {
    setActualHours((currentActualHours) => ({
      ...currentActualHours,
      [projectId]: Math.max(0, Number(((currentActualHours[projectId] ?? 0) + delta).toFixed(1))),
    }));
  }

  return (
    <div className={todayPlannerOverviewStyles.layout}>
      <div className={todayPlannerOverviewStyles.stack}>
        <SectionIntro
          eyebrow="Hoje"
          title="Planejamento do ciclo com horas disponiveis, redistribuicao e ajuste real"
          description="A tela Agora consome a carteira de projetos e a carga aberta das tasks para sugerir a escala do dia. O usuario recalcula o ciclo, compara percentuais e registra as horas reais executadas."
        />
        <StateNotice
          eyebrow="Estado transversal"
          title="Plano do dia baseado em mocks locais"
          description="A escala usa a carteira e a carga abertas atuais, mas ainda nao recebe as alteracoes feitas em outras rotas de forma compartilhada."
          tone="warning"
        />
        <p className={todayPlannerOverviewStyles.planningMoment}>Momento atual do plano · {formatPlanningMoment(new Date())}</p>

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
            <CardTitle>Base para a priorizacao da escala</CardTitle>
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