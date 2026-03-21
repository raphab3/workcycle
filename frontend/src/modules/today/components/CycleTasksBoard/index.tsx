import { Button } from '@/shared/components/Button';
import { CardContent } from '@/shared/components/Card';
import { cn } from '@/shared/utils/cn';

import { formatHours } from '@/modules/today/utils/planner';

import { cycleTasksBoardStyles } from './styles';
import type { CycleTasksBoardProps } from './types';

export function CycleTasksBoard({ availableHours, nextCycleTasksCount, onCompleteTask, onSkipTask, taskPlan }: CycleTasksBoardProps) {
  return (
    <CardContent className={cycleTasksBoardStyles.wrapper}>
      <div className={cycleTasksBoardStyles.summary}>
        <div className={cycleTasksBoardStyles.summaryItem}>
          <p className={cycleTasksBoardStyles.summaryLabel}>Capacidade do cycle</p>
          <p className={cycleTasksBoardStyles.summaryValue}>{formatHours(availableHours)}</p>
        </div>
        <div className={cycleTasksBoardStyles.summaryItem}>
          <p className={cycleTasksBoardStyles.summaryLabel}>Horas alocadas em tasks</p>
          <p className={cycleTasksBoardStyles.summaryValue}>{formatHours(taskPlan.plannedHours)}</p>
        </div>
        <div className={cycleTasksBoardStyles.summaryItem}>
          <p className={cycleTasksBoardStyles.summaryLabel}>Folga ou excesso</p>
          <p className={cycleTasksBoardStyles.summaryValue}>
            {taskPlan.overflowHours > 0 ? `+${formatHours(taskPlan.overflowHours)} acima` : `${formatHours(taskPlan.remainingHours)} livres`}
          </p>
        </div>
      </div>

      {taskPlan.tasks.length === 0 ? (
        <div className={cycleTasksBoardStyles.empty}>
          Nenhuma task entrou no cycle atual. Use a tela Tarefas para puxar itens do backlog ou do proximo cycle quando sobrar tempo no dia.
        </div>
      ) : (
        <div className={cycleTasksBoardStyles.list}>
          {taskPlan.tasks.map((task) => (
            <article key={task.taskId} className={cn(cycleTasksBoardStyles.item, !task.fitsInCycle && cycleTasksBoardStyles.itemOverflow)}>
              <div className={cycleTasksBoardStyles.top}>
                <div>
                  <h3 className={cycleTasksBoardStyles.title}>{task.title}</h3>
                  <p className={cycleTasksBoardStyles.copy}>{task.projectName} · {task.dueLabel} · {formatHours(task.estimatedHours)} previstas</p>
                  <div className={cycleTasksBoardStyles.meta}>
                    <span className={cn(cycleTasksBoardStyles.badge, task.fitsInCycle ? cycleTasksBoardStyles.badgeFit : cycleTasksBoardStyles.badgeOverflow)}>
                      {task.fitsInCycle ? `Cabe no cycle ate ${formatHours(task.cumulativeHours)}` : `Excede o cycle em ${formatHours(task.cumulativeHours - availableHours)}`}
                    </span>
                    <span className={cn(cycleTasksBoardStyles.badge, cycleTasksBoardStyles.badgeProject)}>{task.projectName}</span>
                  </div>
                </div>
              </div>

              <div className={cycleTasksBoardStyles.actions}>
                <Button type="button" variant="outline" onClick={() => onSkipTask(task.taskId)}>Pular para proximo cycle</Button>
                <Button type="button" onClick={() => onCompleteTask(task.taskId)}>Concluir task</Button>
              </div>
            </article>
          ))}
        </div>
      )}

      <p className={cycleTasksBoardStyles.summaryLabel}>Fila preparada para depois: {nextCycleTasksCount} task(s) no proximo cycle.</p>
    </CardContent>
  );
}