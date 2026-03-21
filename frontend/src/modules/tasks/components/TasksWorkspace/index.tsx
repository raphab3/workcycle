'use client';

import { useState } from 'react';

import { mockProjects } from '@/modules/projects/mocks/projects';
import type { Project } from '@/modules/projects/types';
import { mockTasks } from '@/modules/tasks/mocks/tasks';
import type { Task, TaskFiltersValues, TaskFormValues } from '@/modules/tasks/types';
import { filterTasks, getOpenEffortHours, getOpenTasksCount, getProjectLoadSummary, getUrgentTasksCount } from '@/modules/tasks/utils/tasks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/Card';
import { EmptyState } from '@/shared/components/EmptyState';
import { SectionIntro } from '@/shared/components/SectionIntro';
import { StateNotice } from '@/shared/components/StateNotice';

import { TaskFilters } from '../TaskFilters/index';
import { TaskForm } from '../TaskForm/index';
import { TasksList } from '../TasksList/index';
import { tasksWorkspaceStyles } from './styles';

const baseFilters: TaskFiltersValues = {
  projectId: 'all',
  priority: 'all',
  status: 'all',
};

function createTaskId(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

export function TasksWorkspace() {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filters, setFilters] = useState<TaskFiltersValues>(baseFilters);
  const [tasks, setTasks] = useState<Task[]>(mockTasks);

  const projects: Project[] = mockProjects;
  const filteredTasks = filterTasks(tasks, filters);
  const projectLoad = getProjectLoadSummary(tasks, projects);

  function handleSubmitTask(values: TaskFormValues, taskId?: string) {
    if (taskId) {
      setTasks((currentTasks) => currentTasks.map((task) => (task.id === taskId ? { ...task, ...values } : task)));
      setEditingTask(null);
      return;
    }

    setTasks((currentTasks) => [{ id: `${createTaskId(values.title)}-${currentTasks.length + 1}`, ...values }, ...currentTasks]);
  }

  function handleToggleDone(taskId: string) {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId
          ? { ...task, status: task.status === 'done' ? 'todo' : 'done' }
          : task,
      ),
    );
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
          title="Backlog local e derivado da carteira"
          description="Os filtros e o resumo usam a carteira do mock atual. Sem persistencia compartilhada, a sincronizacao entre telas ainda e parcial."
          tone="warning"
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