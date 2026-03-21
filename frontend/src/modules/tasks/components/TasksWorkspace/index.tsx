'use client';

import { useState } from 'react';

import type { Project } from '@/modules/projects/types';
import type { Task, TaskFiltersValues, TaskFormValues } from '@/modules/tasks/types';
import { filterTasks, getOpenEffortHours, getOpenTasksCount, getProjectLoadSummary, getUrgentTasksCount } from '@/modules/tasks/utils/tasks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/Card';
import { EmptyState } from '@/shared/components/EmptyState';
import { SectionIntro } from '@/shared/components/SectionIntro';
import { StateNotice } from '@/shared/components/StateNotice';
import { useWorkspaceStore } from '@/shared/store/useWorkspaceStore';

import { TaskFilters } from '../TaskFilters/index';
import { TaskForm } from '../TaskForm/index';
import { TasksList } from '../TasksList/index';
import { tasksWorkspaceStyles } from './styles';

const baseFilters: TaskFiltersValues = {
  projectId: 'all',
  priority: 'all',
  status: 'all',
};

export function TasksWorkspace() {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filters, setFilters] = useState<TaskFiltersValues>(baseFilters);
  const tasks = useWorkspaceStore((state) => state.tasks);
  const projects: Project[] = useWorkspaceStore((state) => state.projects);
  const addTask = useWorkspaceStore((state) => state.addTask);
  const updateTask = useWorkspaceStore((state) => state.updateTask);
  const toggleTaskDone = useWorkspaceStore((state) => state.toggleTaskDone);
  const filteredTasks = filterTasks(tasks, filters);
  const projectLoad = getProjectLoadSummary(tasks, projects);

  function handleSubmitTask(values: TaskFormValues, taskId?: string) {
    if (taskId) {
      updateTask(taskId, values);
      setEditingTask(null);
      return;
    }

    addTask(values);
  }

  function handleToggleDone(taskId: string) {
    toggleTaskDone(taskId);
  }

  return (
    <div className={tasksWorkspaceStyles.layout}>
      <div className={tasksWorkspaceStyles.stack}>
        <SectionIntro
          eyebrow="Tarefas"
          title="Gestao editorial de tarefas com prioridade, prazo e associacao por projeto"
          description="A tela agora usa a carteira de projetos como base de associacao e filtro. O objetivo deste ciclo e organizar a carga visivel do backlog antes da redistribuicao da tela Hoje."
        />

        <StateNotice
          eyebrow="Estado transversal"
          title="Backlog sincronizado com a carteira ativa"
          description="Projetos, tarefas e contexto operacional agora compartilham o mesmo estado do workspace enquanto o app estiver aberto."
          tone="info"
        />

        {projects.length === 0 && (
          <EmptyState
            eyebrow="Tarefas"
            title="Sem projetos para associar tasks"
            description="A tela de backlog depende da carteira ativa para registrar e agrupar tarefas por projeto."
            hint="Cadastre projetos primeiro para liberar o fluxo completo desta rota."
          />
        )}

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
        </div>

        <TaskFilters filters={filters} onChange={setFilters} onReset={() => setFilters(baseFilters)} projects={projects} visibleTasks={filteredTasks.length} />

        <Card>
          <CardHeader>
            <CardDescription>{editingTask ? 'Editar tarefa selecionada' : 'Nova tarefa'}</CardDescription>
            <CardTitle>{editingTask ? editingTask.title : 'Adicionar item ao backlog visivel'}</CardTitle>
          </CardHeader>
          <CardContent>
            <TaskForm defaultValues={editingTask} onCancelEdit={() => setEditingTask(null)} onSubmitTask={handleSubmitTask} projects={projects} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Resumo por projeto</CardDescription>
            <CardTitle>Carga aberta reaproveitando a carteira do Cycle 2</CardTitle>
          </CardHeader>
          <CardContent className={tasksWorkspaceStyles.projectLoad}>
            {projectLoad.map((project) => (
              <div key={project.projectId} className={tasksWorkspaceStyles.projectItem}>
                <div className={tasksWorkspaceStyles.projectMeta}>
                  <span className={tasksWorkspaceStyles.color} style={{ backgroundColor: project.colorHex }} />
                  <div>
                    <p className={tasksWorkspaceStyles.projectName}>{project.projectName}</p>
                    <p className={tasksWorkspaceStyles.projectDetails}>{project.openTasks} tarefa(s) abertas</p>
                  </div>
                </div>
                <p className={tasksWorkspaceStyles.projectName}>{project.effortHours.toFixed(1).replace('.', ',')}h</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <TasksList onEditTask={setEditingTask} onToggleDone={handleToggleDone} projects={projects} tasks={filteredTasks} />
    </div>
  );
}