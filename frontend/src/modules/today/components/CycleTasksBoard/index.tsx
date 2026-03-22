import Link from 'next/link';
import { useState } from 'react';

import { Button } from '@/shared/components/Button';
import { CardContent } from '@/shared/components/Card';
import { getTaskDeadlineLabel } from '@/modules/tasks/utils/tasks';
import { getTodayBoardColumns, getTodayBoardTasks } from '@/modules/today/utils/taskBoard';
import { cn } from '@/shared/utils/cn';

import { cycleTasksBoardStyles } from './styles';
import type { CycleTasksBoardProps } from './types';

const priorityLabels = {
  critical: 'Critica',
  high: 'Alta',
  medium: 'Media',
  low: 'Baixa',
} as const;

const columnToneClassNames = {
  backlog: cycleTasksBoardStyles.backlogTone,
  'in-progress': cycleTasksBoardStyles.inProgressTone,
  done: cycleTasksBoardStyles.doneTone,
} as const;

export function CycleTasksBoard({ activeProject, onMoveTaskToColumn, onSkipTask, taskColumns, tasks }: CycleTasksBoardProps) {
  const [pendingSkipTaskId, setPendingSkipTaskId] = useState<string | null>(null);
  const boardColumns = getTodayBoardColumns(taskColumns);
  const boardTasks = getTodayBoardTasks(tasks, taskColumns, activeProject.id);
  const totalTaskCount = boardColumns.reduce((total, column) => total + boardTasks[column.key].length, 0);

  return (
    <CardContent className={cycleTasksBoardStyles.wrapper}>
      <p className={cycleTasksBoardStyles.helper}>
        Board fixo do projeto ativo. As mudancas feitas aqui refletem imediatamente na rota de tarefas.
      </p>

      {totalTaskCount === 0 ? (
        <div className={cycleTasksBoardStyles.empty}>
          <p>Nenhuma task do projeto {activeProject.name} entrou no cycle atual. Puxe itens do backlog na rota de tarefas para montar o board operacional de hoje.</p>
          <Button asChild type="button" variant="outline">
            <Link href="/tarefas">Abrir tarefas</Link>
          </Button>
        </div>
      ) : (
        <div className={cycleTasksBoardStyles.board}>
          {boardColumns.map((column) => (
            <section key={column.key} className={cycleTasksBoardStyles.column} aria-label={`Coluna ${column.title}`}>
              <div className={cycleTasksBoardStyles.columnHeader}>
                <div className={cycleTasksBoardStyles.columnMeta}>
                  <h3 className={cycleTasksBoardStyles.columnTitle}>{column.title}</h3>
                  <p className={cycleTasksBoardStyles.columnCount}>{boardTasks[column.key].length} task(s)</p>
                </div>
                <span className={cn(cycleTasksBoardStyles.columnTone, columnToneClassNames[column.key])}>{column.title}</span>
              </div>

              <div className={cycleTasksBoardStyles.columnList}>
                {boardTasks[column.key].map((task) => (
                  <article key={task.id} className={cycleTasksBoardStyles.card}>
                    <div>
                      <h4 className={cycleTasksBoardStyles.cardTitle}>{task.title}</h4>
                      <p className={cycleTasksBoardStyles.cardMeta}>{getTaskDeadlineLabel(task)} · {task.estimatedHours.toFixed(1).replace('.', ',')}h previstas</p>
                    </div>

                    <div className={cycleTasksBoardStyles.cardFooter}>
                      <span className={cn(cycleTasksBoardStyles.badge, cycleTasksBoardStyles[task.priority])}>{priorityLabels[task.priority]}</span>
                    </div>

                    <div className={cycleTasksBoardStyles.selectWrap}>
                      <label className={cycleTasksBoardStyles.selectLabel} htmlFor={`today-task-column-${task.id}`}>
                        Mover para
                      </label>
                      <select
                        id={`today-task-column-${task.id}`}
                        aria-label={`Mover ${task.title}`}
                        className={cycleTasksBoardStyles.select}
                        value={column.key}
                        onChange={(event) => {
                          const targetColumn = boardColumns.find((candidate) => candidate.key === event.target.value);

                          if (!targetColumn?.targetColumnId) {
                            return;
                          }

                          onMoveTaskToColumn(task.id, targetColumn.targetColumnId);
                        }}
                      >
                        {boardColumns.map((option) => (
                          <option key={option.key} value={option.key}>{option.title}</option>
                        ))}
                      </select>
                    </div>

                    {pendingSkipTaskId === task.id ? (
                      <div className={cycleTasksBoardStyles.skipConfirm}>
                        <p className={cycleTasksBoardStyles.skipConfirmCopy}>Escolha como essa task deve entrar no proximo dia.</p>
                        <div className={cycleTasksBoardStyles.skipConfirmActions}>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              onSkipTask(task.id, 'reset-to-backlog');
                              setPendingSkipTaskId(null);
                            }}
                          >
                            Resetar para Backlog no proximo dia
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              onSkipTask(task.id, 'keep-stage');
                              setPendingSkipTaskId(null);
                            }}
                          >
                            Manter estagio atual no proximo cycle
                          </Button>
                          <Button type="button" size="sm" variant="ghost" onClick={() => setPendingSkipTaskId(null)}>
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button type="button" size="sm" variant="ghost" className={cycleTasksBoardStyles.skipButton} onClick={() => setPendingSkipTaskId(task.id)}>
                        Pular para proximo cycle
                      </Button>
                    )}
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </CardContent>
  );
}