import Link from 'next/link';
import { CheckSquare2, MoreHorizontal } from 'lucide-react';
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

export function CycleTasksBoard({ activeProject, onMoveTaskOnBoard, onOpenTask, onSkipTask, taskColumns, tasks }: CycleTasksBoardProps) {
  const [activeMenuTaskId, setActiveMenuTaskId] = useState<string | null>(null);
  const [pendingSkipTaskId, setPendingSkipTaskId] = useState<string | null>(null);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{ columnKey: keyof typeof columnToneClassNames; beforeTaskId: string | null } | null>(null);
  const boardColumns = getTodayBoardColumns(taskColumns);
  const boardTasks = getTodayBoardTasks(tasks, taskColumns, activeProject.id);
  const totalTaskCount = boardColumns.reduce((total, column) => total + boardTasks[column.key].length, 0);

  function handleMoveTask(taskId: string, columnKey: keyof typeof columnToneClassNames, beforeTaskId?: string) {
    const targetColumn = boardColumns.find((candidate) => candidate.key === columnKey);

    if (!targetColumn?.targetColumnId) {
      return;
    }

    onMoveTaskOnBoard(taskId, targetColumn.targetColumnId, beforeTaskId);
    setActiveMenuTaskId(null);
    setDropTarget(null);
  }

  return (
    <CardContent className={cycleTasksBoardStyles.wrapper}>
      {activeMenuTaskId ? <button aria-label="Fechar acoes" className={cycleTasksBoardStyles.menuBackdrop} onClick={() => setActiveMenuTaskId(null)} type="button" /> : null}

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

              <div
                aria-label={`Lista ${column.title}`}
                className={cn(
                  cycleTasksBoardStyles.columnList,
                  dropTarget?.columnKey === column.key && dropTarget.beforeTaskId === null && cycleTasksBoardStyles.columnListDropTarget,
                )}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDropTarget({ columnKey: column.key, beforeTaskId: null });
                }}
                onDrop={(event) => {
                  event.preventDefault();

                  if (!draggedTaskId) {
                    return;
                  }

                  handleMoveTask(draggedTaskId, column.key);
                  setDraggedTaskId(null);
                }}
              >
                {boardTasks[column.key].length === 0 ? (
                  <div className={cycleTasksBoardStyles.columnEmpty}>Arraste tasks para esta coluna.</div>
                ) : (
                  boardTasks[column.key].map((task) => {
                    const completedChecklistItems = task.checklist.filter((item) => item.done).length;

                    return (
                      <article
                        key={task.id}
                        className={cn(
                          cycleTasksBoardStyles.card,
                          draggedTaskId === task.id && cycleTasksBoardStyles.cardDragging,
                          dropTarget?.beforeTaskId === task.id && cycleTasksBoardStyles.cardDropTarget,
                        )}
                        draggable
                        onDragStart={() => {
                          setDraggedTaskId(task.id);
                          setActiveMenuTaskId(null);
                        }}
                        onDragEnd={() => {
                          setDraggedTaskId(null);
                          setDropTarget(null);
                        }}
                        onDragOver={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          setDropTarget({ columnKey: column.key, beforeTaskId: task.id });
                        }}
                        onDrop={(event) => {
                          event.preventDefault();
                          event.stopPropagation();

                          if (!draggedTaskId) {
                            return;
                          }

                          handleMoveTask(draggedTaskId, column.key, task.id);
                          setDraggedTaskId(null);
                        }}
                      >
                        <div className={cycleTasksBoardStyles.cardTop}>
                          <div className={cycleTasksBoardStyles.cardBody}>
                            <h4 className={cycleTasksBoardStyles.cardTitle}>{task.title}</h4>
                            <p className={cycleTasksBoardStyles.cardMeta}>{getTaskDeadlineLabel(task)} · {task.estimatedHours.toFixed(1).replace('.', ',')}h previstas</p>
                          </div>

                          <div className={cycleTasksBoardStyles.cardActionsWrap}>
                            <button
                              aria-label={`Abrir acoes de ${task.title}`}
                              className={cycleTasksBoardStyles.cardActionsButton}
                              onClick={() => setActiveMenuTaskId((currentValue) => currentValue === task.id ? null : task.id)}
                              type="button"
                            >
                              <MoreHorizontal className="h-4.5 w-4.5" aria-hidden="true" />
                            </button>

                            {activeMenuTaskId === task.id ? (
                              <div className={cycleTasksBoardStyles.menu}>
                                <p className={cycleTasksBoardStyles.menuLabel}>Task</p>
                                <button className={cycleTasksBoardStyles.menuAction} onClick={() => {
                                  onOpenTask(task.id);
                                  setActiveMenuTaskId(null);
                                }} type="button">Abrir tarefa</button>
                                <p className={cycleTasksBoardStyles.menuLabel}>Mover para</p>
                                {boardColumns.map((option) => (
                                  <button
                                    key={option.key}
                                    className={cycleTasksBoardStyles.menuAction}
                                    disabled={option.key === column.key || !option.targetColumnId}
                                    onClick={() => handleMoveTask(task.id, option.key)}
                                    type="button"
                                  >
                                    {option.title}
                                  </button>
                                ))}
                                <p className={cycleTasksBoardStyles.menuLabel}>Cycle</p>
                                <button className={cycleTasksBoardStyles.menuAction} onClick={() => {
                                  setPendingSkipTaskId(task.id);
                                  setActiveMenuTaskId(null);
                                }} type="button">Pular para proximo cycle</button>
                              </div>
                            ) : null}
                          </div>
                        </div>

                        <p className={cycleTasksBoardStyles.cardDescription}>{task.description}</p>

                        <div className={cycleTasksBoardStyles.cardFooter}>
                          <span className={cn(cycleTasksBoardStyles.badge, cycleTasksBoardStyles[task.priority])}>{priorityLabels[task.priority]}</span>
                          {task.checklist.length > 0 ? (
                            <span className={cycleTasksBoardStyles.checklistBadge}>
                              <CheckSquare2 className="h-3.5 w-3.5" aria-hidden="true" />
                              {completedChecklistItems}/{task.checklist.length}
                            </span>
                          ) : null}
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
                        ) : null}
                      </article>
                    );
                  })
                )}
              </div>
            </section>
          ))}
        </div>
      )}
    </CardContent>
  );
}