'use client';

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
import { cn } from '@/shared/utils/cn';

import { buildWeeklyScenario, formatWeeklyCell } from '@/modules/weekly/utils/weekly';

import { weeklyBalanceWorkspaceStyles } from './styles';

const statusLabels = {
  balanced: 'Equilibrado',
  attention: 'Atencao',
  critical: 'Critico',
} as const;

export function WeeklyBalanceWorkspace() {
  const projects = useWorkspaceStore((state) => state.projects);
  const tasks = useWorkspaceStore((state) => state.tasks);
  const todayCycleValues = useWorkspaceStore((state) => state.todayCycleValues);
  const todayActualHours = useWorkspaceStore((state) => state.todayActualHours);
  const { rows, summary } = buildWeeklyScenario({
    projects,
    tasks,
    cycleValues: todayCycleValues,
    actualHours: todayActualHours,
  });

  return (
    <div className={weeklyBalanceWorkspaceStyles.layout}>
      <SectionIntro
        eyebrow="Semana"
        title="Leitura semanal de desvios usando horas previstas e horas ajustadas"
        description="A grade semanal deriva do planejamento do dia e do ajuste real do Cycle 4 para indicar onde a execucao ficou equilibrada, em atencao ou critica ao longo da semana corrente."
      />

      <StateNotice
        eyebrow="Estado transversal"
        title="Semana conectada ao estado compartilhado do workspace"
        description="Projetos, tarefas e horas ajustadas do dia agora alimentam a leitura semanal sem depender de mocks isolados por rota."
        tone="info"
      />

      {rows.length === 0 && (
        <EmptyState
          eyebrow="Semana"
          title="Nao ha dados suficientes para consolidar a semana"
          description="A grade semanal depende de projetos ativos e de uma distribuicao diaria minima para montar os desvios."
          hint="Este estado vazio evita que a rota tente renderizar uma semana inconsistente quando a base estiver vazia."
        />
      )}

      <div className={weeklyBalanceWorkspaceStyles.summaryGrid}>
        <Card>
          <CardHeader>
            <CardDescription>Previsto na semana</CardDescription>
            <CardTitle className={weeklyBalanceWorkspaceStyles.metricValue}>{summary.plannedWeekHours.toFixed(1).replace('.', ',')}h</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Real acumulado</CardDescription>
            <CardTitle className={weeklyBalanceWorkspaceStyles.metricValue}>{summary.actualWeekHours.toFixed(1).replace('.', ',')}h</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Projetos em atencao</CardDescription>
            <CardTitle className={weeklyBalanceWorkspaceStyles.metricValue}>{summary.attentionProjects}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Projetos criticos</CardDescription>
            <CardTitle className={weeklyBalanceWorkspaceStyles.metricValue}>{summary.criticalProjects}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div aria-label="Desvios semanais por projeto" className={weeklyBalanceWorkspaceStyles.board} role="table">
        <div className={cn(weeklyBalanceWorkspaceStyles.row, weeklyBalanceWorkspaceStyles.rowHeader)} role="row">
          <span role="columnheader">Projeto</span>
          <span role="columnheader">Seg</span>
          <span role="columnheader">Ter</span>
          <span role="columnheader">Qua</span>
          <span role="columnheader">Qui</span>
          <span role="columnheader">Sex</span>
          <span role="columnheader">Sab</span>
          <span role="columnheader">Previsto</span>
          <span role="columnheader">Real</span>
          <span role="columnheader">Delta</span>
          <span role="columnheader">Status</span>
        </div>

        {rows.map((row, index) => (
          <div key={row.projectId} className={cn(weeklyBalanceWorkspaceStyles.row, index % 2 === 0 && weeklyBalanceWorkspaceStyles.rowAlt)} role="row">
            <span className={weeklyBalanceWorkspaceStyles.projectCell} role="cell">
              <span aria-hidden="true" className={weeklyBalanceWorkspaceStyles.projectColor} style={{ backgroundColor: row.colorHex }} />
              {row.projectName}
            </span>
            {row.cells.map((cell) => (
              <span key={`${row.projectId}-${cell.day}`} className={cell.plannedHours === 0 && cell.actualHours === 0 ? weeklyBalanceWorkspaceStyles.mutedCell : weeklyBalanceWorkspaceStyles.cell} role="cell">
                {formatWeeklyCell(cell)}
              </span>
            ))}
            <span className={weeklyBalanceWorkspaceStyles.cell} role="cell">{row.plannedWeekHours.toFixed(1).replace('.', ',')}h</span>
            <span className={weeklyBalanceWorkspaceStyles.cell} role="cell">{row.actualWeekHours.toFixed(1).replace('.', ',')}h</span>
            <span className={weeklyBalanceWorkspaceStyles.cell} role="cell">{row.deltaHours > 0 ? '+' : ''}{row.deltaHours.toFixed(1).replace('.', ',')}h</span>
            <span
              className={cn(
                weeklyBalanceWorkspaceStyles.status,
                row.status === 'balanced' && weeklyBalanceWorkspaceStyles.statusBalanced,
                row.status === 'attention' && weeklyBalanceWorkspaceStyles.statusAttention,
                row.status === 'critical' && weeklyBalanceWorkspaceStyles.statusCritical,
              )}
              role="cell"
            >
              {statusLabels[row.status]}
            </span>
          </div>
        ))}
      </div>

      <div className={weeklyBalanceWorkspaceStyles.insightGrid}>
        <Card>
          <CardHeader>
            <CardDescription>Leitura operacional</CardDescription>
            <CardTitle>Como interpretar o desvio semanal</CardTitle>
          </CardHeader>
          <CardContent className={weeklyBalanceWorkspaceStyles.insightList}>
            <div className={weeklyBalanceWorkspaceStyles.insightItem}>
              <div>
                <p className={weeklyBalanceWorkspaceStyles.insightTitle}>Equilibrado</p>
                <p className={weeklyBalanceWorkspaceStyles.insightCopy}>A variacao ficou em ate 0.5h na semana.</p>
              </div>
            </div>
            <div className={weeklyBalanceWorkspaceStyles.insightItem}>
              <div>
                <p className={weeklyBalanceWorkspaceStyles.insightTitle}>Atencao</p>
                <p className={weeklyBalanceWorkspaceStyles.insightCopy}>A execucao se desviou entre 0.5h e 2h do previsto.</p>
              </div>
            </div>
            <div className={weeklyBalanceWorkspaceStyles.insightItem}>
              <div>
                <p className={weeklyBalanceWorkspaceStyles.insightTitle}>Critico</p>
                <p className={weeklyBalanceWorkspaceStyles.insightCopy}>O acumulado ja indica risco claro de desbalanceamento.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Uso do Cycle 4</CardDescription>
            <CardTitle>Base de horas previstas e ajustadas</CardTitle>
          </CardHeader>
          <CardContent className={weeklyBalanceWorkspaceStyles.insightList}>
            {rows.map((row) => (
              <div key={`${row.projectId}-insight`} className={weeklyBalanceWorkspaceStyles.insightItem}>
                <div>
                  <p className={weeklyBalanceWorkspaceStyles.insightTitle}>{row.projectName}</p>
                  <p className={weeklyBalanceWorkspaceStyles.insightCopy}>Previsto {row.plannedWeekHours.toFixed(1).replace('.', ',')}h · Real {row.actualWeekHours.toFixed(1).replace('.', ',')}h</p>
                </div>
                <span className={cn(
                  weeklyBalanceWorkspaceStyles.status,
                  row.status === 'balanced' && weeklyBalanceWorkspaceStyles.statusBalanced,
                  row.status === 'attention' && weeklyBalanceWorkspaceStyles.statusAttention,
                  row.status === 'critical' && weeklyBalanceWorkspaceStyles.statusCritical,
                )}>
                  {statusLabels[row.status]}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}