'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CheckSquare2, Plus, Square } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/shared/components/Button';

import { taskCycleAssignmentValues, taskFormSchema, type TaskFormSchemaInput, type TaskFormSchemaOutput, taskPriorityValues } from './schema';
import { taskFormStyles } from './styles';
import type { TaskFormProps } from './types';

const baseValues: TaskFormSchemaInput = {
  title: '',
  description: '',
  projectId: '',
  columnId: 'backlog',
  checklist: [],
  priority: 'medium',
  status: 'todo',
  cycleAssignment: 'backlog',
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
  blocked: 'CodeReview',
  done: 'Done',
} as const;

const cycleLabels = {
  backlog: 'Backlog',
  current: 'Cycle atual',
  next: 'Proximo cycle',
} as const;

export function TaskForm({ columns, defaultValues, onCancelEdit, onSubmitTask, projects }: TaskFormProps) {
  const fallbackColumn = columns[0];
  const [checklistDraft, setChecklistDraft] = useState('');
  const emptyValues = useMemo<TaskFormSchemaInput>(() => ({
    ...baseValues,
    columnId: fallbackColumn?.id ?? baseValues.columnId,
    status: fallbackColumn?.status ?? baseValues.status,
  }), [fallbackColumn?.id, fallbackColumn?.status]);

  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
  } = useForm<TaskFormSchemaInput, undefined, TaskFormSchemaOutput>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: defaultValues ?? emptyValues,
  });

  const selectedColumnId = watch('columnId');
  const checklist = watch('checklist');

  useEffect(() => {
    reset(defaultValues ?? emptyValues);
    setChecklistDraft('');
  }, [defaultValues, emptyValues, reset]);

  useEffect(() => {
    const selectedColumn = columns.find((column) => column.id === selectedColumnId);

    if (selectedColumn) {
      setValue('status', selectedColumn.status, { shouldDirty: true, shouldValidate: true });
    }
  }, [columns, selectedColumnId, setValue]);

  function handleSubmitForm(values: TaskFormSchemaOutput) {
    onSubmitTask(values, defaultValues?.id);
    reset(emptyValues);
    setChecklistDraft('');
  }

  function handleAddChecklistItem() {
    const normalizedValue = checklistDraft.trim();

    if (!normalizedValue) {
      return;
    }

    setValue('checklist', [...checklist, { id: '', label: normalizedValue, done: false }], { shouldDirty: true, shouldValidate: true });
    setChecklistDraft('');
  }

  function handleToggleChecklistItem(index: number) {
    setValue('checklist', checklist.map((item, itemIndex) => (
      itemIndex === index ? { ...item, done: !item.done } : item
    )), { shouldDirty: true, shouldValidate: true });
  }

  function handleRemoveChecklistItem(index: number) {
    setValue('checklist', checklist.filter((_, itemIndex) => itemIndex !== index), { shouldDirty: true, shouldValidate: true });
  }

  return (
    <form className={taskFormStyles.form} onSubmit={handleSubmit(handleSubmitForm)}>
      <div className={taskFormStyles.grid}>
        <div className={taskFormStyles.field}>
          <label className={taskFormStyles.label} htmlFor="task-title">Titulo da tarefa</label>
          <input className={taskFormStyles.input} id="task-title" placeholder="Ex: Revisar backlog do projeto" {...register('title')} />
          {errors.title ? <p className={taskFormStyles.error}>{errors.title.message}</p> : <p className={taskFormStyles.helper}>Descreva a entrega em formato acionavel.</p>}
        </div>

        <div className={taskFormStyles.fieldWide}>
          <label className={taskFormStyles.label} htmlFor="task-description">Descricao</label>
          <textarea className={taskFormStyles.textarea} id="task-description" placeholder="Contexto, objetivo e observacoes para quem abrir esta task depois." {...register('description')} />
          {errors.description ? <p className={taskFormStyles.error}>{errors.description.message}</p> : <p className={taskFormStyles.helper}>Essa descricao aparece resumida no card e completa no drawer.</p>}
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
          <label className={taskFormStyles.label} htmlFor="task-column">Coluna do quadro</label>
          <select className={taskFormStyles.select} id="task-column" {...register('columnId')}>
            {columns.map((column) => (
              <option key={column.id} value={column.id}>{column.title}</option>
            ))}
          </select>
          {errors.columnId ? <p className={taskFormStyles.error}>{errors.columnId.message}</p> : <p className={taskFormStyles.helper}>A coluna define o fluxo visivel do kanban e sincroniza a fase da task.</p>}
        </div>

        <input type="hidden" {...register('status')} />

        <div className={taskFormStyles.field}>
          <label className={taskFormStyles.label} htmlFor="task-status-preview">Fase vinculada</label>
          <div className={taskFormStyles.preview} id="task-status-preview">{statusLabels[watch('status')]}</div>
          <p className={taskFormStyles.helper}>A fase operacional acompanha a coluna escolhida no board.</p>
        </div>

        <div className={taskFormStyles.field}>
          <label className={taskFormStyles.label} htmlFor="task-cycle">Alocacao no cycle</label>
          <select className={taskFormStyles.select} id="task-cycle" {...register('cycleAssignment')}>
            {taskCycleAssignmentValues.map((value) => (
              <option key={value} value={value}>{cycleLabels[value]}</option>
            ))}
          </select>
          <p className={taskFormStyles.helper}>Puxe a task para o cycle atual quando quiser ocupar a folga do dia ou prepare o proximo cycle.</p>
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

      <div className={taskFormStyles.checklistSection}>
        <div>
          <p className={taskFormStyles.label}>Checklist</p>
          <p className={taskFormStyles.helper}>Adicione passos menores para acompanhar progresso sem sair da task.</p>
        </div>

        <div className={taskFormStyles.checklistComposer}>
          <input
            aria-label="Novo item do checklist"
            className={taskFormStyles.input}
            placeholder="Ex: Validar fluxo em staging"
            value={checklistDraft}
            onChange={(event) => setChecklistDraft(event.target.value)}
          />
          <Button type="button" variant="outline" onClick={handleAddChecklistItem}>
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />Adicionar item
          </Button>
        </div>

        <div className={taskFormStyles.checklistList}>
          {checklist.length === 0 ? (
            <div className={taskFormStyles.checklistEmpty}>Nenhum item de checklist ainda.</div>
          ) : (
            checklist.map((item, index) => (
              <div key={`${item.label}-${index}`} className={taskFormStyles.checklistItem}>
                <button aria-label={`Alternar ${item.label}`} className={taskFormStyles.checklistToggle} onClick={() => handleToggleChecklistItem(index)} type="button">
                  {item.done ? <CheckSquare2 className="h-4.5 w-4.5" aria-hidden="true" /> : <Square className="h-4.5 w-4.5" aria-hidden="true" />}
                </button>
                <p className={taskFormStyles.checklistText}>{item.label}</p>
                <Button type="button" size="sm" variant="ghost" onClick={() => handleRemoveChecklistItem(index)}>Remover</Button>
              </div>
            ))
          )}
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