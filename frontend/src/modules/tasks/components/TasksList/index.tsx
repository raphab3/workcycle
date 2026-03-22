 'use client';

import { MoreHorizontal, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/shared/components/Button';
import { cn } from '@/shared/utils/cn';

import type { Task } from '@/modules/tasks/types';
import { getTaskChecklistProgress, getTaskDeadlineLabel, getTaskDeadlineState } from '@/modules/tasks/utils/tasks';

import { tasksListStyles } from './styles';
import type { TasksListProps } from './types';

const priorityLabels = {
  critical: 'Critica',
  high: 'Alta',
  medium: 'Media',
  low: 'Baixa',
} as const;

const statusLabels = {
  todo: 'Todo',
  doing: 'Doing',
  blocked: 'CodeReview',
  done: 'Done',
} as const;

const cycleLabels = {
  current: 'Cycle atual',
  next: 'Proximo cycle',
  backlog: 'Backlog',
} as const;

export function TasksList({ onAddColumn, onArchiveTask, onAssignCycle, onDeleteTask, onEditTask, onMoveTaskToColumn, onRemoveColumn, onToggleDone, projects, taskColumns, tasks }: TasksListProps) {
  const [columnTitle, setColumnTitle] = useState('');
  const [columnStatus, setColumnStatus] = useState<TasksListProps['taskColumns'][number]['status']>('todo');
  const [activeMenuTaskId, setActiveMenuTaskId] = useState<string | null>(null);

  function handleCreateColumn() {
    const normalizedTitle = columnTitle.trim();

    if (!normalizedTitle) {
      return;
    }

    onAddColumn({ title: normalizedTitle, status: columnStatus });
    setColumnTitle('');
    setColumnStatus('todo');
  }

  function handleMenuAction(action: () => void) {
    action();
    setActiveMenuTaskId(null);
  }

  return (
    <section className={tasksListStyles.board}>
      {activeMenuTaskId ? <button aria-label="Fechar opcoes" className="fixed inset-0 z-10 cursor-default" onClick={() => setActiveMenuTaskId(null)} type="button" /> : null}

      <div className={tasksListStyles.boardHeader}>
        <div className={tasksListStyles.boardCopy}>
          <h2 className={tasksListStyles.boardTitle}>Tasks</h2>
          <p className={tasksListStyles.boardDescription}>Abra a task no drawer, mova por select e deixe o restante das acoes concentrado no menu do card.</p>
        </div>

        <div className={tasksListStyles.actions}>
          <Button type="button" variant="outline" onClick={handleCreateColumn}>Adicionar coluna</Button>
        </div>
      </div>

      <div className={tasksListStyles.boardScroller}>
        <div className={tasksListStyles.boardColumns}>
          {taskColumns.map((column) => {
            const columnTasks = tasks.filter((task) => task.columnId === column.id);

            return (
              <section key={column.id} className={tasksListStyles.column}>
                <div className={tasksListStyles.columnHeader}>
                  <div className={tasksListStyles.columnMeta}>
                    <h3 className={tasksListStyles.columnTitle}>{column.title}</h3>
                    <p className={tasksListStyles.columnCount}>{columnTasks.length} card(s)</p>
                  </div>
                  <div className={tasksListStyles.columnActions}>
                    <span className={tasksListStyles.columnTone}>{statusLabels[column.status]}</span>
                    {taskColumns.length > 1 ? (
                      <button aria-label={`Remover coluna ${column.title}`} className={tasksListStyles.columnRemoveButton} onClick={() => onRemoveColumn(column)} type="button">
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    ) : null}
                  </div>
                </div>

                <div className={tasksListStyles.columnList}>
                  {columnTasks.length === 0 ? (
                    <div className={tasksListStyles.columnEmpty}>Nenhuma task nesta coluna com os filtros atuais.</div>
                  ) : (
                    columnTasks.map((task) => {
                      const project = projects.find((candidate) => candidate.id === task.projectId);
                      const deadlineState = getTaskDeadlineState(task);

                      return (
                        <article key={task.id} className={tasksListStyles.item}>
                          <div className={tasksListStyles.top}>
                            <div className={tasksListStyles.body}>
                              <button className={tasksListStyles.title} onClick={() => onEditTask(task)} type="button">{task.title}</button>
                              <p className={tasksListStyles.meta}>
                                {project?.name ?? 'Projeto nao encontrado'} · {getTaskDeadlineLabel(task)} · {task.estimatedHours.toFixed(1).replace('.', ',')}h previstas
                              </p>
                              <p className={tasksListStyles.description}>{task.description}</p>
                              <p className={tasksListStyles.checklistSummary}>{getTaskChecklistProgress(task)}</p>
                            </div>

                            <div className={tasksListStyles.menuWrap}>
                              <button aria-label={`Abrir opcoes de ${task.title}`} className={tasksListStyles.menuButton} onClick={() => setActiveMenuTaskId((current) => current === task.id ? null : task.id)} type="button">
                                <MoreHorizontal className="h-4.5 w-4.5" aria-hidden="true" />
                              </button>

                              {activeMenuTaskId === task.id ? (
                                <div className={tasksListStyles.menu}>
                                  <p className={tasksListStyles.menuLabel}>Abrir</p>
                                  <button className={tasksListStyles.menuAction} onClick={() => handleMenuAction(() => onEditTask(task))} type="button">Abrir task</button>
                                  <p className={tasksListStyles.menuLabel}>Mover para</p>
                                  <select aria-label={`Mover ${task.title}`} className={tasksListStyles.menuSelect} value={task.columnId} onChange={(event) => handleMenuAction(() => onMoveTaskToColumn(task.id, event.target.value))}>
                                    {taskColumns.map((option) => (
                                      <option key={option.id} value={option.id}>{option.title}</option>
                                    ))}
                                  </select>
                                  <p className={tasksListStyles.menuLabel}>Cycle</p>
                                  <select aria-label={`Cycle ${task.title}`} className={tasksListStyles.menuSelect} value={task.cycleAssignment} onChange={(event) => handleMenuAction(() => onAssignCycle(task.id, event.target.value as Task['cycleAssignment']))}>
                                    {Object.entries(cycleLabels).map(([value, label]) => (
                                      <option key={value} value={value}>{label}</option>
                                    ))}
                                  </select>
                                  <p className={tasksListStyles.menuLabel}>Acoes</p>
                                  <button className={tasksListStyles.menuAction} onClick={() => handleMenuAction(() => onEditTask(task))} type="button">Editar</button>
                                  <button className={tasksListStyles.menuAction} onClick={() => handleMenuAction(() => onToggleDone(task.id))} type="button">{task.status === 'done' ? 'Reabrir' : 'Concluir'}</button>
                                  <button className={tasksListStyles.menuAction} onClick={() => handleMenuAction(() => onArchiveTask(task))} type="button">Arquivar</button>
                                  <button className={cn(tasksListStyles.menuAction, tasksListStyles.menuActionDanger)} onClick={() => handleMenuAction(() => onDeleteTask(task))} type="button">Excluir</button>
                                </div>
                              ) : null}
                            </div>
                          </div>

                          <div className={tasksListStyles.chips}>
                            <span className={cn(tasksListStyles.chip, tasksListStyles[task.priority])}>{priorityLabels[task.priority]}</span>
                            <span className={cn(tasksListStyles.chip, tasksListStyles[task.status])}>{statusLabels[task.status]}</span>
                            <span className={cn(tasksListStyles.chip, tasksListStyles[deadlineState])}>{deadlineState === 'overdue' ? 'Atrasada' : deadlineState === 'today' ? 'Hoje' : deadlineState === 'soon' ? 'Curto prazo' : 'Planejada'}</span>
                            <span className={cn(tasksListStyles.chip, tasksListStyles.cycleChip)}>{cycleLabels[task.cycleAssignment]}</span>
                          </div>

                          <div className={tasksListStyles.footer}>
                            <p className={tasksListStyles.footerText}>Abra a task para editar descricao e checklist. Mude coluna e cycle pelo menu do card.</p>
                          </div>
                        </article>
                      );
                    })
                  )}
                </div>
              </section>
            );
          })}

          <section className={tasksListStyles.addColumnPanel}>
            <div className={tasksListStyles.addColumnForm}>
              <div className={tasksListStyles.boardCopy}>
                <h3 className={tasksListStyles.columnTitle}>Nova coluna</h3>
                <p className={tasksListStyles.addColumnHint}>Crie colunas dinamicamente sem perder o mapeamento de prioridade, cycle e fase operacional.</p>
              </div>

              <input
                aria-label="Nome da coluna"
                className={tasksListStyles.addColumnInput}
                placeholder="Ex: Waiting QA"
                value={columnTitle}
                onChange={(event) => setColumnTitle(event.target.value)}
              />

              <select aria-label="Categoria da coluna" className={tasksListStyles.moveSelect} value={columnStatus} onChange={(event) => setColumnStatus(event.target.value as TasksListProps['taskColumns'][number]['status'])}>
                <option value="todo">Backlog</option>
                <option value="doing">In Progress</option>
                <option value="blocked">CodeReview</option>
                <option value="done">Done</option>
              </select>

              <Button type="button" onClick={handleCreateColumn}>Criar coluna</Button>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}