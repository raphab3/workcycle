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

const cycleLabels = {
  current: 'Cycle atual',
  next: 'Proximo cycle',
  backlog: 'Backlog',
} as const;

export function TasksList({ onAssignCycle, onEditTask, onToggleDone, projects, tasks }: TasksListProps) {
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
              <span className={cn(tasksListStyles.chip, tasksListStyles.cycleChip)}>{cycleLabels[task.cycleAssignment]}</span>
            </div>

            <div className={tasksListStyles.footer}>
              <p className={tasksListStyles.footerText}>Realocar a task muda imediatamente a capacidade do cycle atual na tela Hoje.</p>
              <div className={tasksListStyles.actions}>
                <Button type="button" variant={task.cycleAssignment === 'current' ? 'default' : 'outline'} onClick={() => onAssignCycle(task.id, 'current')}>Cycle atual</Button>
                <Button type="button" variant={task.cycleAssignment === 'next' ? 'default' : 'outline'} onClick={() => onAssignCycle(task.id, 'next')}>Proximo cycle</Button>
                <Button type="button" variant={task.cycleAssignment === 'backlog' ? 'default' : 'outline'} onClick={() => onAssignCycle(task.id, 'backlog')}>Backlog</Button>
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