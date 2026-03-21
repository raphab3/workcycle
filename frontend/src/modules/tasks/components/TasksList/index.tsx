import { Button } from '@/shared/components/Button';
import { EmptyState } from '@/shared/components/EmptyState';
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
  blocked: 'Blocked',
  done: 'Done',
} as const;

export function TasksList({ onEditTask, onToggleDone, projects, tasks }: TasksListProps) {
  if (tasks.length === 0) {
    return (
      <EmptyState
        eyebrow="Sem resultados"
        title="Nenhuma tarefa atende aos filtros"
        description="Ajuste projeto, prioridade ou status para recuperar itens da carteira atual."
        hint="Os filtros usam a base de projetos criada na tela Projetos."
      />
    );
  }

  return (
    <div className={tasksListStyles.list}>
      {tasks.map((task) => {
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
            </div>

            <div className={tasksListStyles.footer}>
              <p className={tasksListStyles.footerText}>Projeto associado via carteira do Cycle 2.</p>
              <div className={tasksListStyles.actions}>
                <Button type="button" variant="outline" onClick={() => onEditTask(task)}>Editar</Button>
                <Button type="button" variant="ghost" onClick={() => onToggleDone(task.id)}>
                  {task.status === 'done' ? 'Reabrir' : 'Concluir'}
                </Button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}