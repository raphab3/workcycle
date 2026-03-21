import { Button } from '@/shared/components/Button';

import { taskFiltersStyles } from './styles';
import type { TaskFiltersProps } from './types';

const priorityOptions = [
  { label: 'Todas prioridades', value: 'all' },
  { label: 'Critica', value: 'critical' },
  { label: 'Alta', value: 'high' },
  { label: 'Media', value: 'medium' },
  { label: 'Baixa', value: 'low' },
] as const;

const statusOptions = [
  { label: 'Todos status', value: 'all' },
  { label: 'Todo', value: 'todo' },
  { label: 'Doing', value: 'doing' },
  { label: 'Blocked', value: 'blocked' },
  { label: 'Done', value: 'done' },
] as const;

const cycleOptions = [
  { label: 'Todos os cycles', value: 'all' },
  { label: 'Cycle atual', value: 'current' },
  { label: 'Proximo cycle', value: 'next' },
  { label: 'Backlog', value: 'backlog' },
] as const;

export function TaskFilters({ filters, onChange, onReset, projects, visibleTasks }: TaskFiltersProps) {
  return (
    <section className={taskFiltersStyles.wrapper}>
      <div className={taskFiltersStyles.header}>
        <h2 className={taskFiltersStyles.title}>Filtros conectados aos projetos</h2>
        <p className={taskFiltersStyles.description}>A associacao vem da carteira criada em Projetos. Isso prepara o resumo de carga e o uso futuro na tela Hoje.</p>
      </div>

      <div className={taskFiltersStyles.grid}>
        <div className={taskFiltersStyles.field}>
          <label className={taskFiltersStyles.label} htmlFor="filter-project">Projeto</label>
          <select
            className={taskFiltersStyles.select}
            id="filter-project"
            value={filters.projectId}
            onChange={(event) => onChange({ ...filters, projectId: event.target.value })}
          >
            <option value="all">Todos os projetos</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
        </div>

        <div className={taskFiltersStyles.field}>
          <label className={taskFiltersStyles.label} htmlFor="filter-priority">Prioridade</label>
          <select
            className={taskFiltersStyles.select}
            id="filter-priority"
            value={filters.priority}
            onChange={(event) => onChange({ ...filters, priority: event.target.value as TaskFiltersProps['filters']['priority'] })}
          >
            {priorityOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        <div className={taskFiltersStyles.field}>
          <label className={taskFiltersStyles.label} htmlFor="filter-status">Status</label>
          <select
            className={taskFiltersStyles.select}
            id="filter-status"
            value={filters.status}
            onChange={(event) => onChange({ ...filters, status: event.target.value as TaskFiltersProps['filters']['status'] })}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        <div className={taskFiltersStyles.field}>
          <label className={taskFiltersStyles.label} htmlFor="filter-cycle">Cycle</label>
          <select
            className={taskFiltersStyles.select}
            id="filter-cycle"
            value={filters.cycleAssignment}
            onChange={(event) => onChange({ ...filters, cycleAssignment: event.target.value as TaskFiltersProps['filters']['cycleAssignment'] })}
          >
            {cycleOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className={taskFiltersStyles.footer}>
        <p className={taskFiltersStyles.summary}>{visibleTasks} tarefa(s) visivel(is) com os filtros atuais.</p>
        <Button type="button" variant="outline" onClick={onReset}>Limpar filtros</Button>
      </div>
    </section>
  );
}