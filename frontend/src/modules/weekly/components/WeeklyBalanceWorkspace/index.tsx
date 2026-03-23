'use client';

import { useMemo } from 'react';

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
import { getApiErrorMessage } from '@/lib/apiError';
import { useAuthStore } from '@/modules/auth/store/useAuthStore';
import { useWorkspaceStore } from '@/shared/store/useWorkspaceStore';
import { cn } from '@/shared/utils/cn';

import { useWeeklyHistoryQuery } from '@/modules/weekly/queries/useWeeklyHistoryQuery';
import { useWeeklySnapshotQuery } from '@/modules/weekly/queries/useWeeklySnapshotQuery';
import { buildWeeklyScenario, formatWeeklyCell } from '@/modules/weekly/utils/weekly';

import { weeklyBalanceWorkspaceStyles } from './styles';

const statusLabels = {
  balanced: 'Equilibrado',
  attention: 'Atencao',
  critical: 'Critico',
} as const;

function formatWeekLabel(weekKey: string | undefined) {
  if (!weekKey) {
    return 'Semana atual';
  }

  return weekKey.replace('-W', ' · Semana ');
}

export function WeeklyBalanceWorkspace() {
  const hasHydratedSession = useAuthStore((state) => state.hasHydrated);
  const sessionStatus = useAuthStore((state) => state.sessionStatus);
  const isAuthLoading = !hasHydratedSession;
  const isAuthenticated = hasHydratedSession && sessionStatus === 'authenticated';
  const projects = useWorkspaceStore((state) => state.projects);
  const tasks = useWorkspaceStore((state) => state.tasks);
  const todayCycleValues = useWorkspaceStore((state) => state.todayCycleValues);
  const todayActualHours = useWorkspaceStore((state) => state.todayActualHours);
  const localScenario = buildWeeklyScenario({
    projects,
    tasks,
    cycleValues: todayCycleValues,
    actualHours: todayActualHours,
  });
  const weeklySnapshotQuery = useWeeklySnapshotQuery({ enabled: isAuthenticated });
  const weeklyHistoryQuery = useWeeklyHistoryQuery({ enabled: isAuthenticated, limit: 4 });
  const requestError = weeklySnapshotQuery.error ?? weeklyHistoryQuery.error;
  const requestErrorMessage = requestError
    ? getApiErrorMessage(requestError, 'Nao foi possivel sincronizar a leitura semanal com o backend.')
    : null;
  const isSyncingWeekly = isAuthenticated && (weeklySnapshotQuery.isPending || weeklyHistoryQuery.isPending);
  const isRefetchingWeekly = isAuthenticated && ((weeklySnapshotQuery.isRefetching && !weeklySnapshotQuery.isPending) || (weeklyHistoryQuery.isRefetching && !weeklyHistoryQuery.isPending));
  const scenario = weeklySnapshotQuery.data ?? localScenario;
  const rows = scenario.rows;
  const summary = scenario.summary;
  const historySnapshots = weeklyHistoryQuery.data?.snapshots ?? [];
  const provisionalCellsCount = useMemo(
    () => rows.reduce((total, row) => total + row.cells.filter((cell) => cell.isProvisional).length, 0),
    [rows],
  );
  const hasProvisionalData = provisionalCellsCount > 0 || scenario.isFinal === false;

  return (
    <div className={weeklyBalanceWorkspaceStyles.layout}>
      <SectionIntro
        eyebrow="Semana"
        title="Leitura semanal de desvios usando horas previstas e horas ajustadas"
        description="A grade semanal deriva do planejamento do dia e do ajuste real do Cycle 4 para indicar onde a execucao ficou equilibrada, em atencao ou critica ao longo da semana corrente."
      />

      {isAuthLoading && (
        <StateNotice
          eyebrow="Autenticacao"
          title="Validando sessao antes de carregar a semana"
          description="A consolidacao semanal real sera sincronizada assim que a sessao autenticada for hidratada no cliente."
          tone="info"
        />
      )}

      {hasHydratedSession && !isAuthenticated && (
        <StateNotice
          eyebrow="Autenticacao"
          title="Entre para sincronizar a semana real"
          description="O fluxo principal de Weekly agora depende do backend autenticado. Fora da sessao autenticada, a tela usa apenas um fallback local de referencia."
          tone="warning"
        />
      )}

      {isSyncingWeekly && (
        <StateNotice
          eyebrow="Sincronizacao"
          title="Carregando consolidacao semanal"
          description="Semana atual e historico recente estao sendo recuperados do backend para montar a leitura hibrida real."
          tone="info"
        />
      )}

      {isRefetchingWeekly && (
        <StateNotice
          eyebrow="Sincronizacao"
          title="Atualizando consolidacao semanal"
          description="O backend confirmou mudancas recentes e a leitura semanal esta sendo reconciliada para evitar divergencia entre Today e Weekly."
          tone="info"
        />
      )}

      {requestErrorMessage && (
        <StateNotice
          eyebrow="Integracao"
          title="Falha ao sincronizar a semana"
          description={requestErrorMessage}
          tone="warning"
        />
      )}

      {!isAuthenticated && (
        <StateNotice
          eyebrow="Estado transversal"
          title="Semana conectada ao estado compartilhado do workspace"
          description="Projetos, tarefas e horas ajustadas do dia ainda alimentam este fallback local enquanto a sessao autenticada nao estiver ativa."
          tone="info"
        />
      )}

      {scenario.weekKey && (
        <StateNotice
          eyebrow="Contrato Weekly"
          title={scenario.isFinal ? `Historico fechado: ${formatWeekLabel(scenario.weekKey)}` : `Semana aberta: ${formatWeekLabel(scenario.weekKey)}`}
          description={scenario.isFinal
            ? 'Os numeros desta semana foram consolidados a partir do snapshot historico persistido.'
            : hasProvisionalData
              ? `A semana atual ainda tem ${provisionalCellsCount} celula(s) provisoria(s) derivadas de Today enquanto houver sessao aberta.`
              : 'A semana atual foi recalculada a partir do backend e esta consistente com Projects, Tasks, Today e Settings.'}
          tone={scenario.isFinal ? 'info' : 'warning'}
        />
      )}

      {rows.length === 0 && (
        <EmptyState
          eyebrow="Semana"
          title="Nao ha dados suficientes para consolidar a semana"
          description={isAuthenticated
            ? 'A API semanal nao retornou linhas para a semana atual nem historico recente para o usuario autenticado.'
            : 'A grade semanal depende de projetos ativos e de uma distribuicao diaria minima para montar os desvios.'}
          hint={isAuthenticated
            ? 'Este estado cobre usuarios novos ou semanas ainda sem consolidacao relevante no backend.'
            : 'Este estado vazio evita que a rota tente renderizar uma semana inconsistente quando a base estiver vazia.'}
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

      {historySnapshots.length > 0 && (
        <Card>
          <CardHeader>
            <CardDescription>Historico recente</CardDescription>
            <CardTitle>Semanas fechadas persistidas</CardTitle>
          </CardHeader>
          <CardContent className={weeklyBalanceWorkspaceStyles.historyList}>
            {historySnapshots.map((snapshot) => (
              <div key={snapshot.weekKey} className={weeklyBalanceWorkspaceStyles.historyItem}>
                <div>
                  <p className={weeklyBalanceWorkspaceStyles.historyTitle}>{formatWeekLabel(snapshot.weekKey)}</p>
                  <p className={weeklyBalanceWorkspaceStyles.historyCopy}>
                    Previsto {snapshot.summary.plannedWeekHours.toFixed(1).replace('.', ',')}h · Real {snapshot.summary.actualWeekHours.toFixed(1).replace('.', ',')}h
                  </p>
                </div>
                <span className={weeklyBalanceWorkspaceStyles.historyMeta}>
                  {snapshot.isFinal ? 'Fechada' : 'Provisoria'}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

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
            {row.cells.map((cell) => {
              const isEmptyCell = cell.plannedHours === 0 && cell.actualHours === 0;

              return (
                <span
                  key={`${row.projectId}-${cell.day}-${cell.date ?? 'na'}`}
                  className={cn(
                    isEmptyCell ? weeklyBalanceWorkspaceStyles.mutedCell : weeklyBalanceWorkspaceStyles.cell,
                    cell.isProvisional && weeklyBalanceWorkspaceStyles.provisionalCell,
                  )}
                  role="cell"
                  title={cell.isProvisional ? 'Dado provisório enquanto a semana atual estiver aberta.' : undefined}
                >
                  {formatWeeklyCell(cell)}
                </span>
              );
            })}
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