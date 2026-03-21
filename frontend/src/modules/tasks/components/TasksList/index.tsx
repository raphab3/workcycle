 'use client';

import { useState } from 'react';

import { Button } from '@/shared/components/Button';
import { cn } from '@/shared/utils/cn';

import { getTaskDeadlineLabel, getTaskDeadlineState } from '@/modules/tasks/utils/tasks';

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

export function TasksList({ onAddColumn, onAssignCycle, onEditTask, onMoveTaskToColumn, onToggleDone, projects, taskColumns, tasks }: TasksListProps) {
  const [columnTitle, setColumnTitle] = useState('');
  const [columnStatus, setColumnStatus] = useState<TasksListProps['taskColumns'][number]['status']>('todo');

  function handleCreateColumn() {
    const normalizedTitle = columnTitle.trim();

    if (!normalizedTitle) {
      return;
    }

    onAddColumn({ title: normalizedTitle, status: columnStatus });
    setColumnTitle('');
    setColumnStatus('todo');
  }

  return (
    <section className={tasksListStyles.board}>
      <div className={tasksListStyles.boardHeader}>
        <div className={tasksListStyles.boardCopy}>
          <h2 className={tasksListStyles.boardTitle}>Quadro kanban da carteira</h2>
          <p className={tasksListStyles.boardDescription}>O board agora cresce horizontalmente no estilo Trello, sem depender de uma coluna lateral para suportar mais cards. Filtros, prioridade, cycle e edicao continuam ativos.</p>
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
                  <span className={tasksListStyles.columnTone}>{statusLabels[column.status]}</span>
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
                            <div>
                              <h2 className={tasksListStyles.title}>{task.title}</h2>
                              <p className={tasksListStyles.meta}>
                                {project?.name ?? 'Projeto nao encontrado'} · {getTaskDeadlineLabel(task)} · {task.estimatedHours.toFixed(1).replace('.', ',')}h previstas
                              </p>
                            </div>
                          </div>

                          <div className={tasksListStyles.chips}>
                            <span className={cn(tasksListStyles.chip, tasksListStyles[task.priority])}>{priorityLabels[task.priority]}</span>
                            <span className={cn(tasksListStyles.chip, tasksListStyles[task.status])}>{statusLabels[task.status]}</span>
                            <span className={cn(tasksListStyles.chip, tasksListStyles[deadlineState])}>{deadlineState === 'overdue' ? 'Atrasada' : deadlineState === 'today' ? 'Hoje' : deadlineState === 'soon' ? 'Curto prazo' : 'Planejada'}</span>
                            <span className={cn(tasksListStyles.chip, tasksListStyles.cycleChip)}>{cycleLabels[task.cycleAssignment]}</span>
                          </div>

                          <div className={tasksListStyles.footer}>
                            <div className={tasksListStyles.footerTop}>
                              <p className={tasksListStyles.footerLabel}>Mover no quadro</p>
                              <select
                                aria-label={`Mover ${task.title}`}
                                className={tasksListStyles.moveSelect}
                                value={task.columnId}
                                onChange={(event) => onMoveTaskToColumn(task.id, event.target.value)}
                              >
                                {taskColumns.map((option) => (
                                  <option key={option.id} value={option.id}>{option.title}</option>
                                ))}
                              </select>
                              <p className={tasksListStyles.footerText}>Realocar a task continua refletindo a capacidade do cycle atual na tela Hoje.</p>
                            </div>

                            <div className={tasksListStyles.footerBottom}>
                              <Button type="button" size="sm" variant={task.cycleAssignment === 'current' ? 'default' : 'outline'} onClick={() => onAssignCycle(task.id, 'current')}>Cycle atual</Button>
                              <Button type="button" size="sm" variant={task.cycleAssignment === 'next' ? 'default' : 'outline'} onClick={() => onAssignCycle(task.id, 'next')}>Proximo cycle</Button>
                              <Button type="button" size="sm" variant={task.cycleAssignment === 'backlog' ? 'default' : 'outline'} onClick={() => onAssignCycle(task.id, 'backlog')}>Backlog</Button>
                              <Button type="button" size="sm" variant="outline" onClick={() => onEditTask(task)}>Editar</Button>
                              <Button type="button" size="sm" variant="ghost" onClick={() => onToggleDone(task.id)}>
                                {task.status === 'done' ? 'Reabrir' : 'Concluir'}
                              </Button>
                            </div>
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