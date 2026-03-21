'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/shared/components/Button';

import { taskFormSchema, type TaskFormSchemaInput, type TaskFormSchemaOutput, taskPriorityValues, taskStatusValues } from './schema';
import { taskFormStyles } from './styles';
import type { TaskFormProps } from './types';

const baseValues: TaskFormSchemaInput = {
  title: '',
  projectId: '',
  priority: 'medium',
  status: 'todo',
  dueInDays: 2,
  estimatedHours: 1,
};

const priorityLabels = {
  critical: 'Critica',
  high: 'Alta',
  medium: 'Media',
  low: 'Baixa',
} as const;

const statusLabels = {
  todo: 'Todo',
  doing: 'Doing',
  blocked: 'Blocked',
  done: 'Done',
} as const;

export function TaskForm({ defaultValues, onCancelEdit, onSubmitTask, projects }: TaskFormProps) {
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<TaskFormSchemaInput, undefined, TaskFormSchemaOutput>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: defaultValues ?? baseValues,
  });

  useEffect(() => {
    reset(defaultValues ?? baseValues);
  }, [defaultValues, reset]);

  function handleSubmitForm(values: TaskFormSchemaOutput) {
    onSubmitTask(values, defaultValues?.id);
    reset(baseValues);
  }

  return (
    <form className={taskFormStyles.form} onSubmit={handleSubmit(handleSubmitForm)}>
      <div className={taskFormStyles.grid}>
        <div className={taskFormStyles.field}>
          <label className={taskFormStyles.label} htmlFor="task-title">Titulo da tarefa</label>
          <input className={taskFormStyles.input} id="task-title" placeholder="Ex: Revisar backlog do projeto" {...register('title')} />
          {errors.title ? <p className={taskFormStyles.error}>{errors.title.message}</p> : <p className={taskFormStyles.helper}>Descreva a entrega em formato acionavel.</p>}
        </div>

        <div className={taskFormStyles.field}>
          <label className={taskFormStyles.label} htmlFor="task-project">Projeto</label>
          <select className={taskFormStyles.select} id="task-project" {...register('projectId')}>
            <option value="">Selecione</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
          {errors.projectId && <p className={taskFormStyles.error}>{errors.projectId.message}</p>}
        </div>

        <div className={taskFormStyles.field}>
          <label className={taskFormStyles.label} htmlFor="task-priority">Prioridade</label>
          <select className={taskFormStyles.select} id="task-priority" {...register('priority')}>
            {taskPriorityValues.map((value) => (
              <option key={value} value={value}>{priorityLabels[value]}</option>
            ))}
          </select>
        </div>

        <div className={taskFormStyles.field}>
          <label className={taskFormStyles.label} htmlFor="task-status">Status</label>
          <select className={taskFormStyles.select} id="task-status" {...register('status')}>
            {taskStatusValues.map((value) => (
              <option key={value} value={value}>{statusLabels[value]}</option>
            ))}
          </select>
        </div>

        <div className={taskFormStyles.field}>
          <label className={taskFormStyles.label} htmlFor="task-due">Prazo em dias</label>
          <input className={taskFormStyles.input} id="task-due" type="number" min={0} max={30} {...register('dueInDays', { valueAsNumber: true })} />
          {errors.dueInDays ? <p className={taskFormStyles.error}>{errors.dueInDays.message}</p> : <p className={taskFormStyles.helper}>Use 0 para itens que vencem hoje.</p>}
        </div>

        <div className={taskFormStyles.field}>
          <label className={taskFormStyles.label} htmlFor="task-hours">Esforco estimado (h)</label>
          <input className={taskFormStyles.input} id="task-hours" type="number" min={0.5} max={16} step="0.5" {...register('estimatedHours', { valueAsNumber: true })} />
          {errors.estimatedHours ? <p className={taskFormStyles.error}>{errors.estimatedHours.message}</p> : <p className={taskFormStyles.helper}>Esse valor alimenta o resumo por projeto.</p>}
        </div>
      </div>

      <div className={taskFormStyles.footer}>
        <p className={taskFormStyles.footerText}>
          {defaultValues ? 'Edite a tarefa selecionada sem perder a associacao com o projeto.' : 'Cadastre tarefas associando prioridade, prazo e esforco previsto.'}
        </p>
        <div className={taskFormStyles.actions}>
          {defaultValues && (
            <Button type="button" variant="outline" onClick={onCancelEdit}>
              Cancelar edicao
            </Button>
          )}
          <Button type="submit">{defaultValues ? 'Salvar tarefa' : 'Adicionar tarefa'}</Button>
        </div>
      </div>
    </form>
  );
}