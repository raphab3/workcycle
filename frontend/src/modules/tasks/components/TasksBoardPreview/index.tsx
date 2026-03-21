import { EmptyState } from '@/shared/components/EmptyState';
import { SectionIntro } from '@/shared/components/SectionIntro';
import { cn } from '@/shared/utils/cn';

import { tasksBoardPreviewStyles } from './styles';

const tasks = [
  { title: 'Ajustar migration de faturamento', project: 'DataVault', due: 'vence hoje', priority: 'Critica', priorityClass: tasksBoardPreviewStyles.chipCritical, status: 'Todo' },
  { title: 'Fechar refinamento da sprint', project: 'FinTrack', due: 'vence em 2 dias', priority: 'Alta', priorityClass: tasksBoardPreviewStyles.chipHigh, status: 'Doing' },
  { title: 'Revisar daily contract baseline', project: 'ClienteCore', due: 'sem prazo definido', priority: 'Media', priorityClass: tasksBoardPreviewStyles.chipStatus, status: 'Todo' },
];

export function TasksBoardPreview() {
  return (
    <div className={tasksBoardPreviewStyles.layout}>
      <div className={tasksBoardPreviewStyles.list}>
        <SectionIntro
          eyebrow="Tarefas"
          title="Visao de carga por projeto, prioridade e prazo"
          description="As tasks do MVP servem para informar a alocacao e dar visibilidade de urgencia. Esta rota organiza o backlog por projeto sem substituir boards externos."
        />

        {tasks.map((task) => (
          <article key={task.title} className={tasksBoardPreviewStyles.item}>
            <div className={tasksBoardPreviewStyles.top}>
              <div>
                <h2 className={tasksBoardPreviewStyles.title}>{task.title}</h2>
                <p className={tasksBoardPreviewStyles.meta}>{task.project} · {task.due}</p>
              </div>
            </div>
            <div className={tasksBoardPreviewStyles.chips}>
              <span className={cn(tasksBoardPreviewStyles.chip, task.priorityClass)}>{task.priority}</span>
              <span className={cn(tasksBoardPreviewStyles.chip, tasksBoardPreviewStyles.chipStatus)}>{task.status}</span>
            </div>
          </article>
        ))}
      </div>

      <EmptyState
        eyebrow="Filtros e resumo"
        title="A lateral vai receber filtros por projeto, status e prioridade"
        description="O ciclo seguinte pode conectar contadores, filtros e agrupamentos, mantendo esta rota como painel informativo para a escala diaria."
        hint="Toda regra de classificacao e contagem que entrar aqui precisa vir acompanhada de testes unitarios."
      />
    </div>
  );
}