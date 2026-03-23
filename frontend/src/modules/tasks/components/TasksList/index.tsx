 'use client';

import { MoreHorizontal } from 'lucide-react';
import { useState } from 'react';

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

export function TasksList({ isDisabled = false, onArchiveTask, onAssignCycle, onEditTask, onMoveTaskToColumn, onToggleDone, projects, taskColumns, tasks }: TasksListProps) {
  const [activeMenuTaskId, setActiveMenuTaskId] = useState<string | null>(null);

  function handleMenuAction(action: () => void) {
    if (isDisabled) {
      return;
    }

    action();
    setActiveMenuTaskId(null);
  }

  return (
    <section className={tasksListStyles.board}>
      {activeMenuTaskId ? <button aria-label="Fechar opcoes" className="fixed inset-0 z-10 cursor-default" onClick={() => setActiveMenuTaskId(null)} type="button" /> : null}

      <div className={tasksListStyles.boardHeader}>
        <div className={tasksListStyles.boardCopy}>
          <h2 className={tasksListStyles.boardTitle}>Tasks</h2>
          <p className={tasksListStyles.boardDescription}>O board usa colunas fixas do backend. Abra a task no drawer e concentre mudancas de fluxo no menu de cada card.</p>
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
                              <button aria-label={`Abrir opcoes de ${task.title}`} className={tasksListStyles.menuButton} disabled={isDisabled} onClick={() => setActiveMenuTaskId((current) => current === task.id ? null : task.id)} type="button">
                                <MoreHorizontal className="h-4.5 w-4.5" aria-hidden="true" />
                              </button>

                              {activeMenuTaskId === task.id ? (
                                <div className={tasksListStyles.menu}>
                                  <p className={tasksListStyles.menuLabel}>Abrir</p>
                                  <button className={tasksListStyles.menuAction} onClick={() => handleMenuAction(() => onEditTask(task))} type="button">Abrir task</button>
                                  <p className={tasksListStyles.menuLabel}>Mover para</p>
                                  <select aria-label={`Mover ${task.title}`} className={tasksListStyles.menuSelect} disabled={isDisabled} value={task.columnId} onChange={(event) => handleMenuAction(() => onMoveTaskToColumn(task.id, event.target.value))}>
                                    {taskColumns.map((option) => (
                                      <option key={option.id} value={option.id}>{option.title}</option>
                                    ))}
                                  </select>
                                  <p className={tasksListStyles.menuLabel}>Cycle</p>
                                  <select aria-label={`Cycle ${task.title}`} className={tasksListStyles.menuSelect} disabled={isDisabled} value={task.cycleAssignment} onChange={(event) => handleMenuAction(() => onAssignCycle(task.id, event.target.value as Task['cycleAssignment']))}>
                                    {Object.entries(cycleLabels).map(([value, label]) => (
                                      <option key={value} disabled={value === 'current' && !task.cycleSessionId} value={value}>{label}</option>
                                    ))}
                                  </select>
                                  <p className={tasksListStyles.menuLabel}>Acoes</p>
                                  <button className={tasksListStyles.menuAction} onClick={() => handleMenuAction(() => onEditTask(task))} type="button">Editar</button>
                                  <button className={tasksListStyles.menuAction} onClick={() => handleMenuAction(() => onToggleDone(task.id))} type="button">{task.status === 'done' ? 'Reabrir' : 'Concluir'}</button>
                                  <button className={tasksListStyles.menuAction} onClick={() => handleMenuAction(() => onArchiveTask(task))} type="button">Arquivar</button>
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
                            <p className={tasksListStyles.footerText}>Abra a task para editar descricao e checklist. Coluna, cycle, conclusao e arquivamento passam pelo backend.</p>
                          </div>
                        </article>
                      );
                    })
                  )}
                </div>
              </section>
            );
          })}

        </div>
      </div>
    </section>
  );
}