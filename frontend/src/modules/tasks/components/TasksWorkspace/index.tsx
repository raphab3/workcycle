'use client';

import { Plus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { getApiErrorMessage } from '@/lib/apiError';
import { useAuthStore } from '@/modules/auth/store/useAuthStore';
import { useProjectsQuery } from '@/modules/projects/queries/useProjectsQuery';
import type { Project } from '@/modules/projects/types';
import { useArchiveTaskMutation } from '@/modules/tasks/queries/useArchiveTaskMutation';
import { useCreateTaskMutation } from '@/modules/tasks/queries/useCreateTaskMutation';
import { useTasksQuery } from '@/modules/tasks/queries/useTasksQuery';
import { useUpdateTaskMutation } from '@/modules/tasks/queries/useUpdateTaskMutation';
import { useUpdateTaskStatusMutation } from '@/modules/tasks/queries/useUpdateTaskStatusMutation';
import type { PersistedTaskValues, Task, TaskFiltersValues, TaskFormValues } from '@/modules/tasks/types';
import { filterTasks, getCycleTaskCount, getCycleTaskHours, getOpenEffortHours, getOpenTasksCount, getProjectLoadSummary, getUrgentTasksCount } from '@/modules/tasks/utils/tasks';
import { Button } from '@/shared/components/Button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/shared/components/Card';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog/index';
import { EmptyState } from '@/shared/components/EmptyState';
import { OverlayPanel } from '@/shared/components/OverlayPanel/index';
import { SectionIntro } from '@/shared/components/SectionIntro';
import { StateNotice } from '@/shared/components/StateNotice';
import { useWorkspaceStore } from '@/shared/store/useWorkspaceStore';

import { defaultTaskColumns } from '@/modules/tasks/mocks/taskColumns';

import { TaskFilters } from '../TaskFilters/index';
import { TaskForm } from '../TaskForm/index';
import { TasksList } from '../TasksList/index';
import { tasksWorkspaceStyles } from './styles';

const baseFilters: TaskFiltersValues = {
  projectId: 'all',
  priority: 'all',
  status: 'all',
  cycleAssignment: 'all',
};

export function TasksWorkspace() {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filters, setFilters] = useState<TaskFiltersValues>(baseFilters);
  const [isTaskPanelOpen, setIsTaskPanelOpen] = useState(false);
  const [pendingArchiveTask, setPendingArchiveTask] = useState<Task | null>(null);
  const hasHydratedSession = useAuthStore((state) => state.hasHydrated);
  const sessionStatus = useAuthStore((state) => state.sessionStatus);
  const replaceProjects = useWorkspaceStore((state) => state.replaceProjects);
  const replaceTasks = useWorkspaceStore((state) => state.replaceTasks);
  const isAuthLoading = !hasHydratedSession;
  const isAuthenticated = hasHydratedSession && sessionStatus === 'authenticated';
  const projectsQuery = useProjectsQuery({ enabled: isAuthenticated });
  const tasksQuery = useTasksQuery({ enabled: isAuthenticated });
  const createTaskMutation = useCreateTaskMutation();
  const updateTaskMutation = useUpdateTaskMutation();
  const updateTaskStatusMutation = useUpdateTaskStatusMutation();
  const archiveTaskMutation = useArchiveTaskMutation();

  useEffect(() => {
    if (!isAuthenticated || !projectsQuery.data) {
      return;
    }

    replaceProjects(projectsQuery.data);
  }, [isAuthenticated, projectsQuery.data, replaceProjects]);

  useEffect(() => {
    if (!isAuthenticated || !tasksQuery.data) {
      return;
    }

    replaceTasks(tasksQuery.data);
  }, [isAuthenticated, replaceTasks, tasksQuery.data]);

  const projects: Project[] = projectsQuery.data ?? [];
  const tasks = tasksQuery.data ?? [];
  const taskColumns = defaultTaskColumns;
  const filteredTasks = filterTasks(tasks, filters);
  const projectLoad = getProjectLoadSummary(tasks, projects);
  const isSyncingTasks = isAuthenticated && (projectsQuery.isPending || tasksQuery.isPending);
  const isRefetchingTasks = isAuthenticated && ((projectsQuery.isRefetching && !projectsQuery.isPending) || (tasksQuery.isRefetching && !tasksQuery.isPending));
  const isSubmittingTask = createTaskMutation.isPending || updateTaskMutation.isPending || updateTaskStatusMutation.isPending || archiveTaskMutation.isPending;
  const requestError = useMemo(
    () => projectsQuery.error ?? tasksQuery.error ?? createTaskMutation.error ?? updateTaskMutation.error ?? updateTaskStatusMutation.error ?? archiveTaskMutation.error,
    [archiveTaskMutation.error, createTaskMutation.error, projectsQuery.error, tasksQuery.error, updateTaskMutation.error, updateTaskStatusMutation.error],
  );
  const requestErrorMessage = requestError
    ? getApiErrorMessage(requestError, 'Nao foi possivel sincronizar as tasks com o backend.')
    : null;

  function buildPersistedTaskValues(values: TaskFormValues): PersistedTaskValues {
    return {
      ...values,
      cycleSessionId: values.cycleAssignment === 'current'
        ? editingTask?.cycleSessionId ?? null
        : null,
    };
  }

  async function handleSubmitTask(values: TaskFormValues, taskId?: string) {
    if (!isAuthenticated) {
      return;
    }

    const persistedValues = buildPersistedTaskValues(values);

    if (persistedValues.cycleAssignment === 'current' && !persistedValues.cycleSessionId) {
      return;
    }

    if (taskId) {
      await updateTaskMutation.mutateAsync({ taskId, values: persistedValues });
    } else {
      await createTaskMutation.mutateAsync(persistedValues);
    }

    setEditingTask(null);
    setIsTaskPanelOpen(false);
  }

  function handleToggleDone(taskId: string) {
    if (!isAuthenticated) {
      return;
    }

    const task = tasks.find((candidate) => candidate.id === taskId);

    if (!task) {
      return;
    }

    const nextColumn = task.status === 'done'
      ? taskColumns[0]
      : taskColumns.find((column) => column.status === 'done');

    if (!nextColumn) {
      return;
    }

    void updateTaskStatusMutation.mutateAsync({
      taskId,
      columnId: nextColumn.id,
      cycleAssignment: task.cycleAssignment,
      cycleSessionId: task.cycleAssignment === 'current' ? task.cycleSessionId ?? null : null,
      status: nextColumn.status,
    });
  }

  function handleOpenNewTask() {
    setEditingTask(null);
    setIsTaskPanelOpen(true);
  }

  function handleOpenEditTask(task: Task) {
    setEditingTask(task);
    setIsTaskPanelOpen(true);
  }

  function handleCloseTaskPanel() {
    setEditingTask(null);
    setIsTaskPanelOpen(false);
  }

  async function handleConfirmArchiveTask() {
    if (!pendingArchiveTask) {
      return;
    }

    await archiveTaskMutation.mutateAsync({ taskId: pendingArchiveTask.id });
    setPendingArchiveTask(null);
  }

  function handleMoveTaskToColumn(taskId: string, columnId: string) {
    if (!isAuthenticated) {
      return;
    }

    const task = tasks.find((candidate) => candidate.id === taskId);
    const targetColumn = taskColumns.find((column) => column.id === columnId);

    if (!task || !targetColumn) {
      return;
    }

    void updateTaskStatusMutation.mutateAsync({
      taskId,
      columnId: targetColumn.id,
      cycleAssignment: task.cycleAssignment,
      cycleSessionId: task.cycleAssignment === 'current' ? task.cycleSessionId ?? null : null,
      status: targetColumn.status,
    });
  }

  function handleAssignCycle(taskId: string, cycleAssignment: Task['cycleAssignment']) {
    if (!isAuthenticated) {
      return;
    }

    const task = tasks.find((candidate) => candidate.id === taskId);

    if (!task) {
      return;
    }

    const cycleSessionId = cycleAssignment === 'current'
      ? task.cycleSessionId ?? null
      : null;

    if (cycleAssignment === 'current' && !cycleSessionId) {
      return;
    }

    void updateTaskStatusMutation.mutateAsync({
      taskId,
      cycleAssignment,
      cycleSessionId,
    });
  }

  return (
    <div className={tasksWorkspaceStyles.layout}>
      <div className={tasksWorkspaceStyles.stack}>
        <SectionIntro
          eyebrow="Painel de tasks"
          title="Gestao editorial de tarefas com prioridade, prazo e associacao por projeto"
          description="Organize a carteira por projeto, mova tarefas entre colunas persistidas e ajuste o cycle sem perder visibilidade da carga aberta e dos riscos imediatos."
        />

        {isAuthLoading && (
          <StateNotice
            eyebrow="Autenticacao"
            title="Validando sessao antes de carregar tasks"
            description="O board persistido sera sincronizado assim que a sessao autenticada for hidratada no cliente."
            tone="info"
          />
        )}

        {hasHydratedSession && !isAuthenticated && (
          <StateNotice
            eyebrow="Autenticacao"
            title="Entre para sincronizar o board real"
            description="O fluxo principal de Tasks agora depende do backend autenticado e nao usa mais fallback funcional de CRUD local."
            tone="warning"
          />
        )}

        {isSyncingTasks && (
          <StateNotice
            eyebrow="Sincronizacao"
            title="Carregando board persistido"
            description="Projetos e tasks autenticados estao sendo recuperados do backend para montar o quadro atual."
            tone="info"
          />
        )}

        {isRefetchingTasks && (
          <StateNotice
            eyebrow="Sincronizacao"
            title="Atualizando board persistido"
            description="O backend confirmou uma mudanca recente e o board esta sendo reconciliado para evitar divergencia de cache."
            tone="info"
          />
        )}

        {requestErrorMessage && (
          <StateNotice
            eyebrow="Integracao"
            title="Falha ao sincronizar tasks"
            description={requestErrorMessage}
            tone="warning"
          />
        )}

        {isAuthenticated && !isSyncingTasks && !requestErrorMessage && projects.length === 0 && (
          <EmptyState
            eyebrow="Tarefas"
            title="Sem projetos para associar tasks"
            description="A tela de backlog depende da carteira ativa para registrar e agrupar tarefas por projeto."
            hint="Cadastre projetos primeiro para liberar o fluxo completo desta rota."
          />
        )}

        {isAuthenticated && !isSyncingTasks && !requestErrorMessage && projects.length > 0 && filteredTasks.length === 0 && (
          <EmptyState
            eyebrow="Tarefas"
            title="Nenhuma task encontrada"
            description="A lista persistida nao retornou itens para os filtros atuais."
            hint="Crie a primeira task autenticada ou ajuste os filtros para voltar ao board completo."
          />
        )}

        <section className={tasksWorkspaceStyles.toolbar}>
             <div className={tasksWorkspaceStyles.summaryGrid}>
          <Card>
            <CardHeader>
              <CardDescription>Tasks em aberto</CardDescription>
              <CardTitle className={tasksWorkspaceStyles.metricValue}>{getOpenTasksCount(tasks)}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Urgentes</CardDescription>
              <CardTitle className={tasksWorkspaceStyles.metricValue}>{getUrgentTasksCount(tasks)}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Esforco aberto</CardDescription>
              <CardTitle className={tasksWorkspaceStyles.metricValue}>{getOpenEffortHours(tasks).toFixed(1).replace('.', ',')}h</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Cycle atual</CardDescription>
              <CardTitle className={tasksWorkspaceStyles.metricValue}>{getCycleTaskCount(tasks, 'current')} task(s) · {getCycleTaskHours(tasks, 'current').toFixed(1).replace('.', ',')}h</CardTitle>
            </CardHeader>
          </Card>
        </div>
          <Button disabled={!isAuthenticated || projects.length === 0 || isSubmittingTask || isRefetchingTasks} type="button" onClick={handleOpenNewTask}><Plus className="mr-2 h-4.5 w-4.5" aria-hidden="true" />Nova task</Button>
        </section>

        <TaskFilters filters={filters} onChange={setFilters} onReset={() => setFilters(baseFilters)} projects={projects} visibleTasks={filteredTasks.length} />

        <TasksList
          onArchiveTask={setPendingArchiveTask}
          onAssignCycle={handleAssignCycle}
          onEditTask={handleOpenEditTask}
          isDisabled={!isAuthenticated || isSubmittingTask || isRefetchingTasks}
          onMoveTaskToColumn={handleMoveTaskToColumn}
          onToggleDone={handleToggleDone}
          projects={projects}
          taskColumns={taskColumns}
          tasks={filteredTasks}
        />

        <div className={tasksWorkspaceStyles.compactLoad}>
          <div className={tasksWorkspaceStyles.compactLoadHeader}>
            <CardDescription>Resumo por projeto</CardDescription>
            <CardTitle>Carga aberta da carteira atual</CardTitle>
          </div>
          <div className={tasksWorkspaceStyles.compactLoadGrid}>
            {projectLoad.map((project) => (
              <div key={project.projectId} className={tasksWorkspaceStyles.projectItem}>
                <div className={tasksWorkspaceStyles.projectMeta}>
                  <span className={tasksWorkspaceStyles.color} style={{ backgroundColor: project.colorHex }} />
                  <div>
                    <p className={tasksWorkspaceStyles.projectName}>{project.projectName}</p>
                    <p className={tasksWorkspaceStyles.projectDetails}>{project.openTasks} tarefa(s)</p>
                  </div>
                </div>
                <p className={tasksWorkspaceStyles.projectName}>{project.effortHours.toFixed(1).replace('.', ',')}h</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <OverlayPanel
        description="Cadastre ou ajuste uma task sem sair do contexto do kanban. No mobile este painel abre como bottom sheet."
        isOpen={isTaskPanelOpen}
        onClose={handleCloseTaskPanel}
        title={editingTask ? `Editar ${editingTask.title}` : 'Nova task'}
      >
        <TaskForm key={editingTask?.id ?? 'new-task'} columns={taskColumns} defaultValues={editingTask} isDisabled={!isAuthenticated || isSubmittingTask || isRefetchingTasks} isSubmitting={isSubmittingTask} onCancelEdit={handleCloseTaskPanel} onSubmitTask={handleSubmitTask} projects={projects} />
      </OverlayPanel>

      <ConfirmDialog
        confirmLabel="Arquivar"
        description="A task sai do board atual, mas continua preservada no backend para consultas e historico."
        isOpen={Boolean(pendingArchiveTask)}
        onCancel={() => setPendingArchiveTask(null)}
        onConfirm={handleConfirmArchiveTask}
        title="Arquivar task"
      >
        {pendingArchiveTask?.title}
      </ConfirmDialog>
    </div>
  );
}