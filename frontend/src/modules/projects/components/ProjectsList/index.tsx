import { Button } from '@/shared/components/Button';
import { EmptyState } from '@/shared/components/EmptyState';
import { cn } from '@/shared/utils/cn';

import { formatFixedSchedule } from '@/modules/projects/utils/allocation';

import { projectsListStyles } from './styles';
import type { ProjectsListProps } from './types';

export function ProjectsList({ onEditProject, onToggleStatus, projects }: ProjectsListProps) {
  if (projects.length === 0) {
    return (
      <EmptyState
        eyebrow="Carteira vazia"
        title="Nenhum projeto adicionado ainda"
        description="Assim que voce cadastrar a primeira frente, a lista editorial e o resumo percentual aparecem aqui."
        hint="Use o formulario ao lado para adicionar projetos ativos, pausados, fixos ou rotativos."
      />
    );
  }

  return (
    <div className={projectsListStyles.list}>
      {projects.map((project) => (
        <article key={project.id} className={projectsListStyles.item}>
          <div className={projectsListStyles.header}>
            <div>
              <div className={projectsListStyles.titleWrap}>
                <span className={projectsListStyles.color} style={{ backgroundColor: project.colorHex }} />
                <div>
                  <h2 className={projectsListStyles.title}>{project.name}</h2>
                  <p className={projectsListStyles.meta}>{project.allocationPct}% da semana · Sprint {project.sprintDays} dias</p>
                </div>
              </div>

              <div className={projectsListStyles.badges}>
                <span className={cn(projectsListStyles.badge, project.type === 'fixed' ? projectsListStyles.badgeFixed : projectsListStyles.badgeRotative)}>
                  {project.type === 'fixed' ? 'Fixo' : 'Rotativo'}
                </span>
                <span className={cn(projectsListStyles.badge, project.status === 'active' ? projectsListStyles.badgeActive : projectsListStyles.badgePaused)}>
                  {project.status === 'active' ? 'Ativo' : 'Pausado'}
                </span>
              </div>
            </div>
          </div>

          <div className={projectsListStyles.footer}>
            <p className={projectsListStyles.footerText}>{formatFixedSchedule(project)}</p>
            <div className={projectsListStyles.actions}>
              <Button type="button" variant="outline" onClick={() => onEditProject(project)}>
                Editar
              </Button>
              <Button type="button" variant="ghost" onClick={() => onToggleStatus(project.id)}>
                {project.status === 'active' ? 'Pausar' : 'Reativar'}
              </Button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}