'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';

import type { Project } from '@/modules/projects/types';
import type { Task, TaskFiltersValues, TaskFormValues } from '@/modules/tasks/types';
import { filterTasks, getCycleTaskCount, getCycleTaskHours, getOpenEffortHours, getOpenTasksCount, getProjectLoadSummary, getUrgentTasksCount } from '@/modules/tasks/utils/tasks';
import { Button } from '@/shared/components/Button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/shared/components/Card';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog/index';
import { EmptyState } from '@/shared/components/EmptyState';
import { OverlayPanel } from '@/shared/components/OverlayPanel/index';
import { useWorkspaceStore } from '@/shared/store/useWorkspaceStore';

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
  const [pendingColumnRemoval, setPendingColumnRemoval] = useState<string | null>(null);
  const [pendingDeleteTask, setPendingDeleteTask] = useState<Task | null>(null);
  const tasks = useWorkspaceStore((state) => state.tasks);
  const taskColumns = useWorkspaceStore((state) => state.taskColumns);
  const projects: Project[] = useWorkspaceStore((state) => state.projects);
  const addTask = useWorkspaceStore((state) => state.addTask);
  const addTaskColumn = useWorkspaceStore((state) => state.addTaskColumn);
  const archiveTask = useWorkspaceStore((state) => state.archiveTask);
  const deleteTask = useWorkspaceStore((state) => state.deleteTask);
  const moveTaskToColumn = useWorkspaceStore((state) => state.moveTaskToColumn);
  const removeTaskColumn = useWorkspaceStore((state) => state.removeTaskColumn);
  const updateTask = useWorkspaceStore((state) => state.updateTask);
  const toggleTaskDone = useWorkspaceStore((state) => state.toggleTaskDone);
  const setTaskCycleAssignment = useWorkspaceStore((state) => state.setTaskCycleAssignment);
  const filteredTasks = filterTasks(tasks, filters);
  const projectLoad = getProjectLoadSummary(tasks, projects);

  function handleSubmitTask(values: TaskFormValues, taskId?: string) {
    if (taskId) {
      updateTask(taskId, values);
      setEditingTask(null);
      setIsTaskPanelOpen(false);
      return;
    }

    addTask(values);
    setIsTaskPanelOpen(false);
  }

  function handleToggleDone(taskId: string) {
    toggleTaskDone(taskId);
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

  function handleConfirmArchiveTask() {
    if (!pendingArchiveTask) {
      return;
    }

    archiveTask(pendingArchiveTask.id);
    setPendingArchiveTask(null);
  }

  function handleConfirmDeleteTask() {
    if (!pendingDeleteTask) {
      return;
    }

    deleteTask(pendingDeleteTask.id);
    setPendingDeleteTask(null);
  }

  function handleConfirmRemoveColumn() {
    if (!pendingColumnRemoval) {
      return;
    }

    removeTaskColumn(pendingColumnRemoval);
    setPendingColumnRemoval(null);
  }

  return (
    <div className={tasksWorkspaceStyles.layout}>
      <div className={tasksWorkspaceStyles.stack}>
        {projects.length === 0 && (
          <EmptyState
            eyebrow="Tarefas"
            title="Sem projetos para associar tasks"
            description="A tela de backlog depende da carteira ativa para registrar e agrupar tarefas por projeto."
            hint="Cadastre projetos primeiro para liberar o fluxo completo desta rota."
          />
        )}

        <section className={tasksWorkspaceStyles.toolbar}>
          <div className={tasksWorkspaceStyles.toolbarCopy}>
            <h2 className={tasksWorkspaceStyles.toolbarTitle}>Painel de tasks</h2>
            <p className={tasksWorkspaceStyles.toolbarDescription}>{getOpenTasksCount(tasks)} abertas · {getUrgentTasksCount(tasks)} urgentes · {getCycleTaskCount(tasks, 'current')} no cycle atual</p>
          </div>
          <Button type="button" onClick={handleOpenNewTask}><Plus className="mr-2 h-4.5 w-4.5" aria-hidden="true" />Nova task</Button>
        </section>

        <TasksList
          onAddColumn={addTaskColumn}
          onArchiveTask={setPendingArchiveTask}
          onAssignCycle={setTaskCycleAssignment}
          onDeleteTask={setPendingDeleteTask}
          onEditTask={handleOpenEditTask}
          onMoveTaskToColumn={moveTaskToColumn}
          onRemoveColumn={(column) => setPendingColumnRemoval(column.id)}
          onToggleDone={handleToggleDone}
          projects={projects}
          taskColumns={taskColumns}
          tasks={filteredTasks}
        />

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

        <TaskFilters filters={filters} onChange={setFilters} onReset={() => setFilters(baseFilters)} projects={projects} visibleTasks={filteredTasks.length} />
      </div>

      <OverlayPanel
        description="Cadastre ou ajuste uma task sem sair do contexto do kanban. No mobile este painel abre como bottom sheet."
        isOpen={isTaskPanelOpen}
        onClose={handleCloseTaskPanel}
        title={editingTask ? `Editar ${editingTask.title}` : 'Nova task'}
      >
        <TaskForm columns={taskColumns} defaultValues={editingTask} onCancelEdit={handleCloseTaskPanel} onSubmitTask={handleSubmitTask} projects={projects} />
      </OverlayPanel>

      <ConfirmDialog
        confirmLabel="Arquivar"
        description="A task sai do board atual, mas continua preservada no estado local para consulta futura quando a persistencia entrar."
        isOpen={Boolean(pendingArchiveTask)}
        onCancel={() => setPendingArchiveTask(null)}
        onConfirm={handleConfirmArchiveTask}
        title="Arquivar task"
      >
        {pendingArchiveTask?.title}
      </ConfirmDialog>

      <ConfirmDialog
        confirmLabel="Excluir"
        description="Essa acao remove a task do board atual. Use quando o item nao fizer mais parte da carteira."
        isOpen={Boolean(pendingDeleteTask)}
        onCancel={() => setPendingDeleteTask(null)}
        onConfirm={handleConfirmDeleteTask}
        title="Excluir task"
      >
        {pendingDeleteTask?.title}
      </ConfirmDialog>

      <ConfirmDialog
        confirmLabel="Remover coluna"
        description="As tasks desta coluna voltam para o backlog para evitar perda de contexto no board."
        isOpen={Boolean(pendingColumnRemoval)}
        onCancel={() => setPendingColumnRemoval(null)}
        onConfirm={handleConfirmRemoveColumn}
        title="Remover coluna"
      >
        {taskColumns.find((column) => column.id === pendingColumnRemoval)?.title}
      </ConfirmDialog>
    </div>
  );
}