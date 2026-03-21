'use client';

import { useState } from 'react';

import { Card, CardDescription, CardHeader, CardTitle } from '@/shared/components/Card';
import { EmptyState } from '@/shared/components/EmptyState';
import { SectionIntro } from '@/shared/components/SectionIntro';
import { StateNotice } from '@/shared/components/StateNotice';
import { cn } from '@/shared/utils/cn';

import { mockProjects } from '@/modules/projects/mocks/projects';
import type { Project, ProjectFormValues } from '@/modules/projects/types';
import { getActiveAllocationTotal, getAllocationDelta, getAllocationTone } from '@/modules/projects/utils/allocation';

import { ProjectForm } from '../ProjectForm/index';
import { ProjectsList } from '../ProjectsList/index';
import { projectsWorkspaceStyles } from './styles';

function createProjectId(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

export function ProjectsWorkspace() {
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>(mockProjects);

  const activeProjects = projects.filter((project) => project.status === 'active');
  const allocationTotal = getActiveAllocationTotal(projects);
  const allocationDelta = getAllocationDelta(projects);
  const allocationTone = getAllocationTone(projects);

  function handleCancelEdit() {
    setEditingProject(null);
  }

  function handleSubmitProject(values: ProjectFormValues, projectId?: string) {
    if (projectId) {
      setProjects((currentProjects) =>
        currentProjects.map((project) => (project.id === projectId ? { ...project, ...values } : project)),
      );
      setEditingProject(null);
      return;
    }

    setProjects((currentProjects) => [
      {
        id: `${createProjectId(values.name)}-${currentProjects.length + 1}`,
        ...values,
      },
      ...currentProjects,
    ]);
  }

  function handleToggleStatus(projectId: string) {
    setProjects((currentProjects) =>
      currentProjects.map((project) =>
        project.id === projectId
          ? { ...project, status: project.status === 'active' ? 'paused' : 'active' }
          : project,
      ),
    );
  }

  return (
    <div className={projectsWorkspaceStyles.layout}>
      <div className={projectsWorkspaceStyles.stack}>
        <SectionIntro
          eyebrow="Projetos"
          title="Cadastro funcional da carteira com regras de alocacao, sprint e contrato"
          description="Este mock funcional organiza a carteira de trabalho do MVP. O usuario consegue cadastrar projetos, editar dados principais, marcar frentes fixas e visualizar quando a soma percentual semanal sai de 100%."
        />

        <StateNotice
          eyebrow="Estado transversal"
          title="Carteira local do mock"
          description="As alteracoes desta tela ainda nao persistem nem sincronizam automaticamente com as demais rotas."
          tone="warning"
        />

        {projects.length === 0 && (
          <EmptyState
            eyebrow="Projetos"
            title="Nenhuma frente cadastrada"
            description="Cadastre a primeira frente para liberar planejamentos diarios e leitura semanal do mock."
            hint="Este fallback cobre o estado vazio global do modulo e evita a quebra do fluxo nas telas derivadas."
          />
        )}

        <div className={projectsWorkspaceStyles.summaryGrid}>
          <Card>
            <CardHeader>
              <CardDescription>Projetos ativos</CardDescription>
              <CardTitle className={projectsWorkspaceStyles.metricValue}>{activeProjects.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Percentual alocado</CardDescription>
              <CardTitle className={projectsWorkspaceStyles.metricValue}>{allocationTotal}%</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Delta para 100%</CardDescription>
              <CardTitle className={projectsWorkspaceStyles.metricValue}>{allocationDelta > 0 ? `+${allocationDelta}%` : `${allocationDelta}%`}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className={projectsWorkspaceStyles.summaryBanner}>
          <h2 className={projectsWorkspaceStyles.summaryTitle}>Consistencia da carteira semanal</h2>
          <p className={projectsWorkspaceStyles.summaryCopy}>
            A soma dos projetos ativos precisa fechar em 100% para que a escala do dia seja confiavel.
            <span
              className={cn(
                'ml-2 font-medium',
                allocationTone === 'balanced' && projectsWorkspaceStyles.summaryToneBalanced,
                allocationTone === 'under' && projectsWorkspaceStyles.summaryToneUnder,
                allocationTone === 'over' && projectsWorkspaceStyles.summaryToneOver,
              )}
            >
              {allocationTone === 'balanced'
                ? 'A carteira esta equilibrada.'
                : allocationTone === 'under'
                  ? 'Ainda faltam percentuais para distribuir.'
                  : 'A soma passou de 100% e precisa ser ajustada.'}
            </span>
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardDescription>{editingProject ? 'Editar projeto selecionado' : 'Novo projeto'}</CardDescription>
            <CardTitle>{editingProject ? editingProject.name : 'Adicionar frente de trabalho'}</CardTitle>
          </CardHeader>
          <div className="px-6 pb-6">
            <ProjectForm defaultValues={editingProject} onCancelEdit={handleCancelEdit} onSubmitProject={handleSubmitProject} />
          </div>
        </Card>
      </div>

      <ProjectsList projects={projects} onEditProject={setEditingProject} onToggleStatus={handleToggleStatus} />
    </div>
  );
}