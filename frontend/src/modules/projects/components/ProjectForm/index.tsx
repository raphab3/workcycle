'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/shared/components/Button';
import { cn } from '@/shared/utils/cn';

import {
  projectFormSchema,
  type ProjectFormSchemaInput,
  type ProjectFormSchemaOutput,
  sprintDayValues,
  weekDayValues,
} from './schema';
import { projectFormStyles } from './styles';
import type { ProjectFormProps } from './types';

const baseValues: ProjectFormSchemaInput = {
  name: '',
  colorHex: '#506169',
  allocationPct: 10,
  type: 'rotative',
  sprintDays: 14,
  status: 'active',
  fixedDays: [],
  fixedHoursPerDay: 0,
};

export function ProjectForm({ defaultValues, onCancelEdit, onSubmitProject }: ProjectFormProps) {
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
  } = useForm<ProjectFormSchemaInput, undefined, ProjectFormSchemaOutput>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: defaultValues ?? baseValues,
  });

  const projectType = watch('type');
  const fixedDays = watch('fixedDays') ?? [];

  useEffect(() => {
    reset(defaultValues ?? baseValues);
  }, [defaultValues, reset]);

  function handleToggleDay(day: (typeof weekDayValues)[number]) {
    const nextDays = fixedDays.includes(day) ? fixedDays.filter((value) => value !== day) : [...fixedDays, day];
    setValue('fixedDays', nextDays, { shouldValidate: true, shouldDirty: true });
  }

  function handleSubmitForm(values: ProjectFormSchemaOutput) {
    onSubmitProject(values, defaultValues?.id);
    reset(baseValues);
  }

  return (
    <form className={projectFormStyles.form} onSubmit={handleSubmit(handleSubmitForm)}>
      <div className={projectFormStyles.grid}>
        <div className={projectFormStyles.field}>
          <label className={projectFormStyles.label} htmlFor="project-name">Nome do projeto</label>
          <input className={projectFormStyles.input} id="project-name" placeholder="Ex: ClienteCore" {...register('name')} />
          {errors.name ? <p className={projectFormStyles.error}>{errors.name.message}</p> : <p className={projectFormStyles.helper}>Use o nome da frente, cliente ou produto.</p>}
        </div>

        <div className={projectFormStyles.field}>
          <label className={projectFormStyles.label} htmlFor="project-color">Cor de identificacao</label>
          <input className={cn(projectFormStyles.input, 'h-11 w-full p-2')} id="project-color" type="color" {...register('colorHex')} />
          {errors.colorHex && <p className={projectFormStyles.error}>{errors.colorHex.message}</p>}
        </div>

        <div className={projectFormStyles.field}>
          <label className={projectFormStyles.label} htmlFor="project-allocation">Alocacao semanal (%)</label>
          <input className={projectFormStyles.input} id="project-allocation" type="number" min={1} max={100} {...register('allocationPct', { valueAsNumber: true })} />
          {errors.allocationPct && <p className={projectFormStyles.error}>{errors.allocationPct.message}</p>}
        </div>

        <div className={projectFormStyles.field}>
          <label className={projectFormStyles.label} htmlFor="project-sprint">Sprint</label>
          <select className={projectFormStyles.select} id="project-sprint" {...register('sprintDays', { valueAsNumber: true })}>
            {sprintDayValues.map((value) => (
              <option key={value} value={value}>{value} dias</option>
            ))}
          </select>
          {errors.sprintDays && <p className={projectFormStyles.error}>{errors.sprintDays.message}</p>}
        </div>
      </div>

      <div className={projectFormStyles.switchGroup}>
        <div className={projectFormStyles.switchCard}>
          <p className={projectFormStyles.label}>Tipo do projeto</p>
          <div className="mt-3 flex gap-3">
            <label className="inline-flex items-center gap-2 text-sm text-foreground">
              <input type="radio" value="rotative" {...register('type')} />
              Rotativo
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-foreground">
              <input type="radio" value="fixed" {...register('type')} />
              Fixo
            </label>
          </div>
        </div>

        <div className={projectFormStyles.switchCard}>
          <p className={projectFormStyles.label}>Status</p>
          <div className="mt-3 flex gap-3">
            <label className="inline-flex items-center gap-2 text-sm text-foreground">
              <input type="radio" value="active" {...register('status')} />
              Ativo
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-foreground">
              <input type="radio" value="paused" {...register('status')} />
              Pausado
            </label>
          </div>
        </div>
      </div>

      {projectType === 'fixed' && (
        <div className={projectFormStyles.grid}>
          <div className={projectFormStyles.field}>
            <p className={projectFormStyles.label}>Dias fixos</p>
            <div className={projectFormStyles.days}>
              {weekDayValues.map((day) => (
                <button
                  key={day}
                  className={cn(projectFormStyles.dayButton, fixedDays.includes(day) && projectFormStyles.dayButtonActive)}
                  type="button"
                  onClick={() => handleToggleDay(day)}
                >
                  {day}
                </button>
              ))}
            </div>
            {errors.fixedDays ? <p className={projectFormStyles.error}>{errors.fixedDays.message}</p> : <p className={projectFormStyles.helper}>Selecione em quais dias o projeto precisa entrar automaticamente.</p>}
          </div>

          <div className={projectFormStyles.field}>
            <label className={projectFormStyles.label} htmlFor="project-fixed-hours">Horas reservadas por dia</label>
            <input className={projectFormStyles.input} id="project-fixed-hours" type="number" min={0} max={12} step="0.5" {...register('fixedHoursPerDay', { valueAsNumber: true })} />
            {errors.fixedHoursPerDay ? <p className={projectFormStyles.error}>{errors.fixedHoursPerDay.message}</p> : <p className={projectFormStyles.helper}>Exemplo: 2h para daily e desenvolvimento minimo.</p>}
          </div>
        </div>
      )}

      <div className={projectFormStyles.footer}>
        <p className={projectFormStyles.footerText}>
          {defaultValues ? 'Editando projeto selecionado. Salve para atualizar a carteira atual.' : 'Adicione projetos ativos ou pausados para compor o planejamento semanal.'}
        </p>
        <div className={projectFormStyles.actions}>
          {defaultValues && (
            <Button type="button" variant="outline" onClick={onCancelEdit}>
              Cancelar edicao
            </Button>
          )}
          <Button type="submit">{defaultValues ? 'Salvar alteracoes' : 'Adicionar projeto'}</Button>
        </div>
      </div>
    </form>
  );
}