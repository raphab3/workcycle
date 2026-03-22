'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import type { Route } from 'next';
import { useMemo, useState } from 'react';

import { buildDashboardScenario } from '@/modules/dashboard/utils/dashboard';
import { getProjectLoadSummary } from '@/modules/tasks/utils/tasks';
import { buildSuggestedAllocations, formatHours } from '@/modules/today/utils/planner';
import { Button } from '@/shared/components/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/Card';
import { EmptyState } from '@/shared/components/EmptyState';
import { SectionIntro } from '@/shared/components/SectionIntro';
import { StateNotice } from '@/shared/components/StateNotice';
import { useWorkspaceStore } from '@/shared/store/useWorkspaceStore';
import { cn } from '@/shared/utils/cn';

import { DashboardSuggestionBanner } from '../DashboardSuggestionBanner';
import { DashboardTimelineChart } from '../DashboardTimelineChart';
import { dashboardWorkspaceStyles } from './styles';

const weeklyStatusLabels = {
  balanced: 'Equilibrado',
  attention: 'Atencao',
  critical: 'Critico',
} as const;

export function DashboardWorkspace() {
  const [isRiskExpanded, setIsRiskExpanded] = useState(false);
  const projects = useWorkspaceStore((state) => state.projects);
  const tasks = useWorkspaceStore((state) => state.tasks);
  const cycleValues = useWorkspaceStore((state) => state.todayCycleValues);
  const todayActualHours = useWorkspaceStore((state) => state.todayActualHours);
  const cycleDate = useWorkspaceStore((state) => state.cycleDate);

  const activeProjects = useMemo(() => projects.filter((project) => project.status === 'active'), [projects]);
  const allocations = useMemo(() => {
    const projectLoadSummary = getProjectLoadSummary(tasks, activeProjects);

    return buildSuggestedAllocations(activeProjects, projectLoadSummary, cycleValues);
  }, [activeProjects, cycleValues, tasks]);
  const dashboardScenario = useMemo(() => buildDashboardScenario({
    projects,
    tasks,
    cycleValues,
    cycleDate,
    actualHours: todayActualHours,
  }), [cycleDate, cycleValues, projects, tasks, todayActualHours]);

  if (activeProjects.length === 0) {
    return (
      <EmptyState
        eyebrow="Dashboard"
        title="Nao ha dados suficientes para montar a leitura analitica"
        description="Ative projetos e mantenha alguma carga aberta para que o Dashboard consiga consolidar contexto, pressao e distribuicao."
        hint="Sem projetos ativos, a leitura estrategica fica vazia por definicao."
      />
    );
  }

  return (
    <div className={dashboardWorkspaceStyles.layout}>
      <div className={dashboardWorkspaceStyles.headerStack}>
        <section className={dashboardWorkspaceStyles.hero}>
          <div className={dashboardWorkspaceStyles.heroCopy}>
            <SectionIntro
              eyebrow="Dashboard"
              title="Leitura analitica do ciclo atual para decidir onde ajustar antes de executar"
              description="Aqui ficam contexto, pressao, risco e tendencia. O Hoje segue operacional; o Dashboard concentra a leitura estrategica da carteira ativa."
            />

            <div className={dashboardWorkspaceStyles.heroActions}>
              <Button asChild>
                <Link href={'/hoje' satisfies Route}>Abrir Hoje operacional</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={'/semana' satisfies Route}>Ver leitura semanal</Link>
              </Button>
            </div>
          </div>

          <div className={dashboardWorkspaceStyles.heroNotice}>
            <StateNotice
              eyebrow="Uso recomendado"
              title="Leia primeiro, ajuste depois"
              description="Use esta pagina para revisar ritmo, backlog, desvios semanais e sinais de pressao antes de voltar ao Hoje e iniciar ou retomar a sessao."
              tone="info"
            />
          </div>
        </section>

        <div className={dashboardWorkspaceStyles.signalRail}>
          {dashboardScenario.context.contextSignals.map((signal) => (
            <span key={signal} className={dashboardWorkspaceStyles.signalChip}>{signal}</span>
          ))}
        </div>
      </div>

      <section className={dashboardWorkspaceStyles.contextGrid} aria-label="Contexto do ciclo">
        {dashboardScenario.context.cards.map((card) => (
          <Card key={card.id} className={dashboardWorkspaceStyles.contextCard}>
            <CardHeader>
              <CardDescription>{card.eyebrow}</CardDescription>
              <CardTitle>{card.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className={dashboardWorkspaceStyles.sectionCopy}>{card.description}</p>
              <div className={dashboardWorkspaceStyles.contextHighlights}>
                {card.highlights.map((highlight) => (
                  <div key={highlight} className={dashboardWorkspaceStyles.contextHighlight}>{highlight}</div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <DashboardSuggestionBanner allocations={allocations} planningMoment={cycleDate} />

      <section className={dashboardWorkspaceStyles.sectionStack} aria-label="Balanco semanal por projeto">
        <div className={dashboardWorkspaceStyles.sectionHeader}>
          <div>
            <p className={dashboardWorkspaceStyles.riskEyebrow}>Balanco semanal</p>
            <h2 className={dashboardWorkspaceStyles.riskTitle}>Planned vs actual por projeto na semana atual</h2>
            <p className={dashboardWorkspaceStyles.sectionCopy}>A leitura semanal deriva do plano do dia e do ajuste real compartilhado no workspace para mostrar quais frentes estao equilibradas, em atencao ou criticas.</p>
          </div>
          <div className={dashboardWorkspaceStyles.summaryGrid}>
            <Card>
              <CardHeader>
                <CardDescription>Semana prevista</CardDescription>
                <CardTitle className={dashboardWorkspaceStyles.metricValue}>{dashboardScenario.weekly.summary.plannedWeekHours.toFixed(1).replace('.', ',')}h</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>Semana real</CardDescription>
                <CardTitle className={dashboardWorkspaceStyles.metricValue}>{dashboardScenario.weekly.summary.actualWeekHours.toFixed(1).replace('.', ',')}h</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>Projetos sob pressao</CardDescription>
                <CardTitle className={dashboardWorkspaceStyles.metricValue}>{dashboardScenario.weekly.summary.attentionProjects + dashboardScenario.weekly.summary.criticalProjects}</CardTitle>
              </CardHeader>
            </Card>
          </div>
        </div>

        <div className={dashboardWorkspaceStyles.compactTable} role="table" aria-label="Tabela de balanco semanal">
          <div className={cn(dashboardWorkspaceStyles.compactTableRow, dashboardWorkspaceStyles.compactTableHeader)} role="row">
            <span role="columnheader">Projeto</span>
            <span role="columnheader">Previsto</span>
            <span role="columnheader">Real</span>
            <span role="columnheader">Delta</span>
            <span role="columnheader">Status</span>
          </div>

          {dashboardScenario.highlightedWeeklyRows.map((row, index) => (
            <div key={row.projectId} className={cn(dashboardWorkspaceStyles.compactTableRow, index % 2 === 0 && dashboardWorkspaceStyles.compactTableAlt)} role="row">
              <span className={dashboardWorkspaceStyles.projectCell} role="cell">
                <span aria-hidden="true" className={dashboardWorkspaceStyles.projectDot} style={{ backgroundColor: row.colorHex }} />
                {row.projectName}
              </span>
              <span className={dashboardWorkspaceStyles.numericCell} role="cell">{row.plannedWeekHours.toFixed(1).replace('.', ',')}h</span>
              <span className={dashboardWorkspaceStyles.numericCell} role="cell">{row.actualWeekHours.toFixed(1).replace('.', ',')}h</span>
              <span className={dashboardWorkspaceStyles.numericCell} role="cell">{row.deltaHours > 0 ? '+' : ''}{row.deltaHours.toFixed(1).replace('.', ',')}h</span>
              <span
                className={cn(
                  dashboardWorkspaceStyles.status,
                  row.status === 'balanced' && dashboardWorkspaceStyles.statusBalanced,
                  row.status === 'attention' && dashboardWorkspaceStyles.statusAttention,
                  row.status === 'critical' && dashboardWorkspaceStyles.statusCritical,
                )}
                role="cell"
              >
                {weeklyStatusLabels[row.status]}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className={dashboardWorkspaceStyles.lowerGrid}>
        <Card>
          <CardHeader>
            <CardDescription>Pressao por projeto</CardDescription>
            <CardTitle>Resumo da carga aberta da carteira atual</CardTitle>
          </CardHeader>
          <CardContent className={dashboardWorkspaceStyles.loadGrid}>
            {dashboardScenario.loadRows.map((project) => (
              <div key={project.projectId} className={dashboardWorkspaceStyles.loadItem}>
                <div className={dashboardWorkspaceStyles.loadMeta}>
                  <span aria-hidden="true" className={dashboardWorkspaceStyles.projectDot} style={{ backgroundColor: project.colorHex }} />
                  <div>
                    <p className={dashboardWorkspaceStyles.loadName}>{project.projectName}</p>
                    <p className={dashboardWorkspaceStyles.loadCopy}>{project.openTasks} task(s) abertas · {project.overdueTasks} atrasadas · {project.blockedTasks} bloqueadas</p>
                  </div>
                </div>
                <div className={dashboardWorkspaceStyles.loadEffort}>
                  <p className={dashboardWorkspaceStyles.loadEffortHours}>{project.effortHours.toFixed(1).replace('.', ',')}h</p>
                  <p className={dashboardWorkspaceStyles.loadEffortScore}>Score {project.pressureScore.toFixed(0)}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className={dashboardWorkspaceStyles.riskHeader}>
            <div>
              <CardDescription>Sinais de risco e pressao</CardDescription>
              <CardTitle>O que pede decisao antes de mexer no plano</CardTitle>
            </div>
            <Button type="button" variant="outline" onClick={() => setIsRiskExpanded((value) => !value)}>
              {isRiskExpanded ? 'Recolher detalhes' : 'Expandir detalhes'}
              {isRiskExpanded ? <ChevronUp className="ml-2 h-4 w-4" aria-hidden="true" /> : <ChevronDown className="ml-2 h-4 w-4" aria-hidden="true" />}
            </Button>
          </CardHeader>
          <CardContent>
            <div className={dashboardWorkspaceStyles.riskSummaryGrid}>
              {dashboardScenario.riskSignals.map((signal) => (
                <div
                  key={signal.id}
                  className={cn(
                    dashboardWorkspaceStyles.riskSummaryItem,
                    signal.tone === 'danger' && dashboardWorkspaceStyles.riskDanger,
                    signal.tone === 'warning' && dashboardWorkspaceStyles.riskWarning,
                    signal.tone === 'positive' && dashboardWorkspaceStyles.riskPositive,
                    signal.tone === 'neutral' && dashboardWorkspaceStyles.riskNeutral,
                  )}
                >
                  <p className={dashboardWorkspaceStyles.riskEyebrow}>{signal.eyebrow}</p>
                  <h3 className={dashboardWorkspaceStyles.riskTitle}>{signal.title}</h3>
                  <p className={dashboardWorkspaceStyles.riskDescription}>{signal.description}</p>
                  {isRiskExpanded && signal.details.length > 0 && (
                    <div className={dashboardWorkspaceStyles.riskDetailList}>
                      {signal.details.map((detail) => (
                        <div key={`${signal.id}-${detail}`} className={dashboardWorkspaceStyles.riskDetailItem}>{detail}</div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className={dashboardWorkspaceStyles.sectionStack} aria-label="Tempo registrado na carteira">
        <div>
          <p className={dashboardWorkspaceStyles.riskEyebrow}>Tempo registrado</p>
          <h2 className={dashboardWorkspaceStyles.riskTitle}>Acumulado por projeto na semana atual e janela mensal simulada</h2>
          <p className={dashboardWorkspaceStyles.sectionCopy}>Como o mock ainda nao tem historico persistido, a leitura mensal reaproveita a cadencia observada nesta semana para projetar a janela de quatro semanas.</p>
        </div>

        <Card>
          <CardContent className={dashboardWorkspaceStyles.timeTable}>
            <div className={dashboardWorkspaceStyles.timeRow}>
              <span className={dashboardWorkspaceStyles.timeHeader}>Projeto</span>
              <span className={dashboardWorkspaceStyles.timeHeader}>Semana atual</span>
              <span className={dashboardWorkspaceStyles.timeHeader}>Janela mensal</span>
            </div>
            {dashboardScenario.timeSpentRows.map((row) => (
              <div key={row.projectId} className={dashboardWorkspaceStyles.timeRow}>
                <span className={dashboardWorkspaceStyles.projectCell}>
                  <span aria-hidden="true" className={dashboardWorkspaceStyles.projectDot} style={{ backgroundColor: row.colorHex }} />
                  {row.projectName}
                </span>
                <span className={dashboardWorkspaceStyles.timeValue}>{formatHours(row.weekHours)}</span>
                <span className={dashboardWorkspaceStyles.timeValue}>{formatHours(row.monthHours)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className={dashboardWorkspaceStyles.sectionStack} aria-label="Grafico temporal de horas">
        <DashboardTimelineChart points={dashboardScenario.timeline} />
      </section>
    </div>
  );
}