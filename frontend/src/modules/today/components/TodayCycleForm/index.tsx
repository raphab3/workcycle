'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Button } from '@/shared/components/Button';

import { todayCycleSchema, type TodayCycleSchemaInput, type TodayCycleSchemaOutput } from './schema';
import { todayCycleFormStyles } from './styles';
import type { TodayCycleFormProps } from './types';

export function TodayCycleForm({ defaultValues, onSubmitCycle }: TodayCycleFormProps) {
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<TodayCycleSchemaInput, undefined, TodayCycleSchemaOutput>({
    resolver: zodResolver(todayCycleSchema),
    defaultValues,
  });

  return (
    <form className={todayCycleFormStyles.form} onSubmit={handleSubmit(onSubmitCycle)}>
      <div className={todayCycleFormStyles.grid}>
        <div className={todayCycleFormStyles.field}>
          <label className={todayCycleFormStyles.label} htmlFor="cycle-available-hours">Horas disponiveis hoje</label>
          <input className={todayCycleFormStyles.input} id="cycle-available-hours" type="number" min={1} max={16} step="0.5" {...register('availableHours', { valueAsNumber: true })} />
          {errors.availableHours ? <p className={todayCycleFormStyles.error}>{errors.availableHours.message}</p> : <p className={todayCycleFormStyles.helper}>Use a disponibilidade liquida do dia para montar a escala.</p>}
        </div>

        <div className={todayCycleFormStyles.field}>
          <label className={todayCycleFormStyles.label} htmlFor="cycle-projects-count">Projetos no ciclo</label>
          <input className={todayCycleFormStyles.input} id="cycle-projects-count" type="number" min={1} max={6} {...register('projectsInCycle', { valueAsNumber: true })} />
          {errors.projectsInCycle ? <p className={todayCycleFormStyles.error}>{errors.projectsInCycle.message}</p> : <p className={todayCycleFormStyles.helper}>Define quantas frentes entram no plano do dia.</p>}
        </div>
      </div>

      <div className={todayCycleFormStyles.footer}>
        <p className={todayCycleFormStyles.footerText}>Atualize o plano sempre que a disponibilidade real mudar antes de iniciar a execucao.</p>
        <Button type="submit">Recalcular escala</Button>
      </div>
    </form>
  );
}