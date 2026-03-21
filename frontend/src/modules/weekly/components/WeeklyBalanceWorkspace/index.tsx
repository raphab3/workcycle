import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/Card';
import { SectionIntro } from '@/shared/components/SectionIntro';
import { cn } from '@/shared/utils/cn';

import { buildWeeklyScenario, formatWeeklyCell } from '@/modules/weekly/utils/weekly';

import { weeklyBalanceWorkspaceStyles } from './styles';

const statusLabels = {
  balanced: 'Equilibrado',
  attention: 'Atencao',
  critical: 'Critico',
} as const;

export function WeeklyBalanceWorkspace() {
  const { rows, summary } = buildWeeklyScenario();

  return (
    <div className={weeklyBalanceWorkspaceStyles.layout}>
      <SectionIntro
        eyebrow="Semana"
        title="Leitura semanal de desvios usando horas previstas e horas ajustadas"
        description="A grade semanal deriva do planejamento do dia e do ajuste real do Cycle 4 para indicar onde a execucao ficou equilibrada, em atencao ou critica ao longo da semana corrente."
      />

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

      <div className={weeklyBalanceWorkspaceStyles.board}>
        <div className={cn(weeklyBalanceWorkspaceStyles.row, weeklyBalanceWorkspaceStyles.rowHeader)}>
          <span>Projeto</span>
          <span>Seg</span>
          <span>Ter</span>
          <span>Qua</span>
          <span>Qui</span>
          <span>Sex</span>
          <span>Sab</span>
          <span>Previsto</span>
          <span>Real</span>
          <span>Delta</span>
          <span>Status</span>
        </div>

        {rows.map((row, index) => (
          <div key={row.projectId} className={cn(weeklyBalanceWorkspaceStyles.row, index % 2 === 0 && weeklyBalanceWorkspaceStyles.rowAlt)}>
            <span className={weeklyBalanceWorkspaceStyles.projectCell}>
              <span className={weeklyBalanceWorkspaceStyles.projectColor} style={{ backgroundColor: row.colorHex }} />
              {row.projectName}
            </span>
            {row.cells.map((cell) => (
              <span key={`${row.projectId}-${cell.day}`} className={cell.plannedHours === 0 && cell.actualHours === 0 ? weeklyBalanceWorkspaceStyles.mutedCell : weeklyBalanceWorkspaceStyles.cell}>
                {formatWeeklyCell(cell)}
              </span>
            ))}
            <span className={weeklyBalanceWorkspaceStyles.cell}>{row.plannedWeekHours.toFixed(1).replace('.', ',')}h</span>
            <span className={weeklyBalanceWorkspaceStyles.cell}>{row.actualWeekHours.toFixed(1).replace('.', ',')}h</span>
            <span className={weeklyBalanceWorkspaceStyles.cell}>{row.deltaHours > 0 ? '+' : ''}{row.deltaHours.toFixed(1).replace('.', ',')}h</span>
            <span
              className={cn(
                weeklyBalanceWorkspaceStyles.status,
                row.status === 'balanced' && weeklyBalanceWorkspaceStyles.statusBalanced,
                row.status === 'attention' && weeklyBalanceWorkspaceStyles.statusAttention,
                row.status === 'critical' && weeklyBalanceWorkspaceStyles.statusCritical,
              )}
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