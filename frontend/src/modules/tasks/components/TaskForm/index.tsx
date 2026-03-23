'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CheckSquare2, Plus, Square } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

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

export function TaskForm({ autosave = false, autosaveDelayMs = 700, columns, defaultValues, isDisabled = false, isSubmitting = false, onCancelEdit, onSubmitTask, projects }: TaskFormProps) {
  const fallbackColumn = columns[0];
  const [checklistDraft, setChecklistDraft] = useState('');
  const previousTaskIdRef = useRef<string | null>(null);
  const lastAutosavedSignatureRef = useRef<string | null>(null);
  const canUseCurrentCycleAssignment = Boolean(defaultValues?.cycleSessionId);
  const emptyValues = useMemo<TaskFormSchemaInput>(() => ({
    ...baseValues,
    columnId: fallbackColumn?.id ?? baseValues.columnId,
    status: fallbackColumn?.status ?? baseValues.status,
  }), [fallbackColumn?.id, fallbackColumn?.status]);

  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setValue,
  } = useForm<TaskFormSchemaInput, undefined, TaskFormSchemaOutput>({
    resolver: zodResolver(taskFormSchema),
    mode: autosave ? 'onChange' : 'onSubmit',
    defaultValues: defaultValues ?? emptyValues,
  });

  const selectedColumnId = useWatch({ control, name: 'columnId' });
  const selectedCycleAssignment = useWatch({ control, name: 'cycleAssignment' });
  const selectedStatus = useWatch({ control, name: 'status' });
  const checklist = useWatch({ control, name: 'checklist' }) ?? [];
  const watchedValues = useWatch({ control });

  useEffect(() => {
    if (defaultValues) {
      if (previousTaskIdRef.current !== defaultValues.id) {
        reset(defaultValues);
        previousTaskIdRef.current = defaultValues.id;
        lastAutosavedSignatureRef.current = JSON.stringify(taskFormSchema.parse(defaultValues));
      }

      return;
    }

    previousTaskIdRef.current = null;
    lastAutosavedSignatureRef.current = null;
    reset(emptyValues);
  }, [defaultValues, emptyValues, reset]);

  useEffect(() => {
    const selectedColumn = columns.find((column) => column.id === selectedColumnId);

    if (selectedColumn && selectedStatus !== selectedColumn.status) {
      setValue('status', selectedColumn.status, { shouldDirty: true, shouldValidate: true });
    }
  }, [columns, selectedColumnId, selectedStatus, setValue]);

  useEffect(() => {
    if (!canUseCurrentCycleAssignment && selectedCycleAssignment === 'current') {
      setValue('cycleAssignment', 'backlog', { shouldDirty: true, shouldValidate: true });
    }
  }, [canUseCurrentCycleAssignment, selectedCycleAssignment, setValue]);

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

  useEffect(() => {
    if (!autosave || !defaultValues) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const parsedValues = taskFormSchema.safeParse(watchedValues);

      if (!parsedValues.success) {
        return;
      }

      const autosaveSignature = JSON.stringify(parsedValues.data);

      if (autosaveSignature === lastAutosavedSignatureRef.current) {
        return;
      }

      onSubmitTask(parsedValues.data, defaultValues.id);
      lastAutosavedSignatureRef.current = autosaveSignature;
    }, autosaveDelayMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [autosave, autosaveDelayMs, defaultValues, onSubmitTask, watchedValues]);

  return (
    <form className={taskFormStyles.form} onSubmit={handleSubmit(handleSubmitForm)}>
      <div className={taskFormStyles.grid}>
        <div className={taskFormStyles.field}>
          <label className={taskFormStyles.label} htmlFor="task-title">Titulo da tarefa</label>
          <input className={taskFormStyles.input} disabled={isDisabled} id="task-title" placeholder="Ex: Revisar backlog do projeto" {...register('title')} />
          {errors.title ? <p className={taskFormStyles.error}>{errors.title.message}</p> : <p className={taskFormStyles.helper}>Descreva a entrega em formato acionavel.</p>}
        </div>

        <div className={taskFormStyles.fieldWide}>
          <label className={taskFormStyles.label} htmlFor="task-description">Descricao</label>
          <textarea className={taskFormStyles.textarea} disabled={isDisabled} id="task-description" placeholder="Contexto, objetivo e observacoes para quem abrir esta task depois." {...register('description')} />
          {errors.description ? <p className={taskFormStyles.error}>{errors.description.message}</p> : <p className={taskFormStyles.helper}>Essa descricao aparece resumida no card e completa no drawer.</p>}
        </div>

        <div className={taskFormStyles.field}>
          <label className={taskFormStyles.label} htmlFor="task-project">Projeto</label>
          <select className={taskFormStyles.select} disabled={isDisabled} id="task-project" {...register('projectId')}>
            <option value="">Selecione</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
          {errors.projectId && <p className={taskFormStyles.error}>{errors.projectId.message}</p>}
        </div>

        <div className={taskFormStyles.field}>
          <label className={taskFormStyles.label} htmlFor="task-priority">Prioridade</label>
          <select className={taskFormStyles.select} disabled={isDisabled} id="task-priority" {...register('priority')}>
            {taskPriorityValues.map((value) => (
              <option key={value} value={value}>{priorityLabels[value]}</option>
            ))}
          </select>
        </div>

        <div className={taskFormStyles.field}>
          <label className={taskFormStyles.label} htmlFor="task-column">Coluna do quadro</label>
          <select className={taskFormStyles.select} disabled={isDisabled} id="task-column" {...register('columnId')}>
            {columns.map((column) => (
              <option key={column.id} value={column.id}>{column.title}</option>
            ))}
          </select>
          {errors.columnId ? <p className={taskFormStyles.error}>{errors.columnId.message}</p> : <p className={taskFormStyles.helper}>A coluna define o fluxo visivel do kanban e sincroniza a fase da task.</p>}
        </div>

        <input type="hidden" {...register('status')} />

        <div className={taskFormStyles.field}>
          <label className={taskFormStyles.label} htmlFor="task-status-preview">Fase vinculada</label>
          <div className={taskFormStyles.preview} id="task-status-preview">{statusLabels[selectedStatus]}</div>
          <p className={taskFormStyles.helper}>A fase operacional acompanha a coluna escolhida no board.</p>
        </div>

        <div className={taskFormStyles.field}>
          <label className={taskFormStyles.label} htmlFor="task-cycle">Alocacao no cycle</label>
          <select className={taskFormStyles.select} disabled={isDisabled} id="task-cycle" {...register('cycleAssignment')}>
            {taskCycleAssignmentValues.map((value) => (
              <option key={value} disabled={value === 'current' && !canUseCurrentCycleAssignment} value={value}>{cycleLabels[value]}</option>
            ))}
          </select>
          <p className={taskFormStyles.helper}>
            {canUseCurrentCycleAssignment
              ? 'Esta task ja possui um cycle persistido e pode continuar alocada no cycle atual.'
              : 'Novas tasks e itens sem sessao persistida ainda nao podem ser enviados direto para o cycle atual.'}
          </p>
        </div>

        <div className={taskFormStyles.field}>
          <label className={taskFormStyles.label} htmlFor="task-due">Prazo em dias</label>
          <input className={taskFormStyles.input} disabled={isDisabled} id="task-due" type="number" min={0} max={30} {...register('dueInDays', { valueAsNumber: true })} />
          {errors.dueInDays ? <p className={taskFormStyles.error}>{errors.dueInDays.message}</p> : <p className={taskFormStyles.helper}>Use 0 para itens que vencem hoje.</p>}
        </div>

        <div className={taskFormStyles.field}>
          <label className={taskFormStyles.label} htmlFor="task-hours">Esforco estimado (h)</label>
          <input className={taskFormStyles.input} disabled={isDisabled} id="task-hours" type="number" min={0.5} max={16} step="0.5" {...register('estimatedHours', { valueAsNumber: true })} />
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
            disabled={isDisabled}
            placeholder="Ex: Validar fluxo em staging"
            value={checklistDraft}
            onChange={(event) => setChecklistDraft(event.target.value)}
          />
          <Button disabled={isDisabled} type="button" variant="outline" onClick={handleAddChecklistItem}>
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />Adicionar item
          </Button>
        </div>

        <div className={taskFormStyles.checklistList}>
          {checklist.length === 0 ? (
            <div className={taskFormStyles.checklistEmpty}>Nenhum item de checklist ainda.</div>
          ) : (
            checklist.map((item, index) => (
              <div key={`${item.label}-${index}`} className={taskFormStyles.checklistItem}>
                <button aria-label={`Alternar ${item.label}`} className={taskFormStyles.checklistToggle} disabled={isDisabled} onClick={() => handleToggleChecklistItem(index)} type="button">
                  {item.done ? <CheckSquare2 className="h-4.5 w-4.5" aria-hidden="true" /> : <Square className="h-4.5 w-4.5" aria-hidden="true" />}
                </button>
                <p className={taskFormStyles.checklistText}>{item.label}</p>
                <Button disabled={isDisabled} type="button" size="sm" variant="ghost" onClick={() => handleRemoveChecklistItem(index)}>Remover</Button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className={taskFormStyles.footer}>
        <p className={taskFormStyles.footerText}>
          {autosave && defaultValues
            ? 'Alteracoes validas sao salvas automaticamente neste drawer.'
            : defaultValues
              ? 'Edite a tarefa selecionada sem perder a associacao com o projeto.'
              : 'Cadastre tarefas associando prioridade, prazo e esforco previsto.'}
        </p>
        {!autosave && (
          <div className={taskFormStyles.actions}>
            {defaultValues && (
              <Button disabled={isDisabled} type="button" variant="outline" onClick={onCancelEdit}>
                Cancelar edicao
              </Button>
            )}
            <Button disabled={isDisabled || isSubmitting} type="submit">{isSubmitting ? 'Salvando...' : defaultValues ? 'Salvar tarefa' : 'Adicionar tarefa'}</Button>
          </div>
        )}
      </div>
    </form>
  );
}