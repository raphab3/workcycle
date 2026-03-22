'use client';

import { useEffect, useMemo, useState } from 'react';

import { getApiErrorMessage } from '@/lib/apiError';
import { useAuthStore } from '@/modules/auth/store/useAuthStore';
import { useCreateProjectMutation } from '@/modules/projects/queries/useCreateProjectMutation';
import { useProjectsQuery } from '@/modules/projects/queries/useProjectsQuery';
import { useToggleProjectStatusMutation } from '@/modules/projects/queries/useToggleProjectStatusMutation';
import { useUpdateProjectMutation } from '@/modules/projects/queries/useUpdateProjectMutation';

import { Card, CardDescription, CardHeader, CardTitle } from '@/shared/components/Card';
import { EmptyState } from '@/shared/components/EmptyState';
import { SectionIntro } from '@/shared/components/SectionIntro';
import { StateNotice } from '@/shared/components/StateNotice';
import { useWorkspaceStore } from '@/shared/store/useWorkspaceStore';
import { cn } from '@/shared/utils/cn';

import type { Project, ProjectFormValues } from '@/modules/projects/types';
import { getActiveAllocationTotal, getAllocationDelta, getAllocationTone } from '@/modules/projects/utils/allocation';

import { ProjectForm } from '../ProjectForm/index';
import { ProjectsList } from '../ProjectsList/index';
import { projectsWorkspaceStyles } from './styles';

export function ProjectsWorkspace() {
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const hasHydratedSession = useAuthStore((state) => state.hasHydrated);
  const sessionStatus = useAuthStore((state) => state.sessionStatus);
  const replaceProjects = useWorkspaceStore((state) => state.replaceProjects);
  const isAuthLoading = !hasHydratedSession;
  const isAuthenticated = hasHydratedSession && sessionStatus === 'authenticated';
  const projectsQuery = useProjectsQuery({ enabled: isAuthenticated });
  const createProjectMutation = useCreateProjectMutation();
  const updateProjectMutation = useUpdateProjectMutation();
  const toggleProjectStatusMutation = useToggleProjectStatusMutation();

  useEffect(() => {
    if (!isAuthenticated || !projectsQuery.data) {
      return;
    }

    replaceProjects(projectsQuery.data);
  }, [isAuthenticated, projectsQuery.data, replaceProjects]);

  const visibleProjects = projectsQuery.data ?? [];
  const activeProjects = visibleProjects.filter((project) => project.status === 'active');
  const allocationTotal = getActiveAllocationTotal(visibleProjects);
  const allocationDelta = getAllocationDelta(visibleProjects);
  const allocationTone = getAllocationTone(visibleProjects);
  const isSyncingProjects = isAuthenticated && projectsQuery.isPending;
  const isRefetchingProjects = isAuthenticated && projectsQuery.isRefetching && !projectsQuery.isPending;
  const isSubmittingProject = createProjectMutation.isPending || updateProjectMutation.isPending;
  const isTogglingProjectStatus = toggleProjectStatusMutation.isPending;
  const requestError = useMemo(
    () => projectsQuery.error ?? createProjectMutation.error ?? updateProjectMutation.error ?? toggleProjectStatusMutation.error,
    [createProjectMutation.error, projectsQuery.error, toggleProjectStatusMutation.error, updateProjectMutation.error],
  );
  const requestErrorMessage = requestError
    ? getApiErrorMessage(requestError, 'Nao foi possivel sincronizar os projetos com o backend.')
    : null;

  function handleCancelEdit() {
    setEditingProject(null);
  }

  async function handleSubmitProject(values: ProjectFormValues, projectId?: string) {
    if (!isAuthenticated) {
      return;
    }

    if (projectId) {
      await updateProjectMutation.mutateAsync({ projectId, values });
    } else {
      await createProjectMutation.mutateAsync(values);
    }

    setEditingProject(null);
  }

  function handleToggleStatus(projectId: string) {
    if (!isAuthenticated) {
      return;
    }

    const targetProject = visibleProjects.find((project) => project.id === projectId);

    if (!targetProject) {
      return;
    }

    void toggleProjectStatusMutation.mutateAsync({
      projectId,
      status: targetProject.status === 'active' ? 'paused' : 'active',
    });
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
          title="Carteira compartilhada entre as rotas"
          description="As alteracoes desta tela agora alimentam Hoje, Semana e Tarefas em tempo real dentro do workspace atual."
          tone="info"
        />

        {isAuthLoading && (
          <StateNotice
            eyebrow="Autenticacao"
            title="Validando sessao antes de carregar projetos"
            description="A carteira sera sincronizada assim que a sessao autenticada for hidratada no cliente."
            tone="info"
          />
        )}

        {hasHydratedSession && !isAuthenticated && (
          <StateNotice
            eyebrow="Autenticacao"
            title="Entre para sincronizar a carteira real"
            description="O fluxo principal de Projects agora depende do backend autenticado e nao usa mais fallback funcional de mock local."
            tone="warning"
          />
        )}

        {isSyncingProjects && (
          <StateNotice
            eyebrow="Sincronizacao"
            title="Carregando carteira persistida"
            description="Os projetos autenticados estao sendo recuperados do backend para montar a carteira semanal real."
            tone="info"
          />
        )}

        {isRefetchingProjects && (
          <StateNotice
            eyebrow="Sincronizacao"
            title="Atualizando carteira persistida"
            description="O backend confirmou uma mudanca recente e a lista esta sendo reconciliada para evitar divergencia de cache."
            tone="info"
          />
        )}

        {requestErrorMessage && (
          <StateNotice
            eyebrow="Integracao"
            title="Falha ao sincronizar projetos"
            description={requestErrorMessage}
            tone="warning"
          />
        )}

        {isAuthenticated && !isSyncingProjects && !requestErrorMessage && visibleProjects.length === 0 && (
          <EmptyState
            eyebrow="Projetos"
            title="Nenhuma frente cadastrada"
            description="Cadastre a primeira frente para liberar planejamentos diarios e leitura semanal do mock."
            hint="Este estado vazio ja reflete a resposta real do backend para a carteira autenticada."
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
            <ProjectForm
              defaultValues={editingProject}
              isDisabled={!isAuthenticated || isRefetchingProjects}
              isSubmitting={isSubmittingProject}
              onCancelEdit={handleCancelEdit}
              onSubmitProject={handleSubmitProject}
            />
          </div>
        </Card>
      </div>

      <ProjectsList
        isDisabled={!isAuthenticated || isTogglingProjectStatus || isRefetchingProjects}
        projects={visibleProjects}
        onEditProject={setEditingProject}
        onToggleStatus={handleToggleStatus}
      />
    </div>
  );
}