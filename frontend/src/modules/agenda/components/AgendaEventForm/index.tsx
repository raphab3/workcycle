'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/shared/components/Button';

import { agendaEventFormSchema, type AgendaEventFormSchemaInput, type AgendaEventFormSchemaOutput } from './schema';
import { agendaEventFormStyles } from './styles';
import type { AgendaEventFormProps } from './types';

import { toDatetimeLocalValue } from '@/modules/agenda/utils/agenda';

const baseValues: AgendaEventFormSchemaInput = {
  calendarId: '',
  description: '',
  endAt: '',
  location: '',
  startAt: '',
  title: '',
};

function toFormValues(defaultValues?: AgendaEventFormProps['defaultValues']): AgendaEventFormSchemaInput {
  if (!defaultValues) {
    return baseValues;
  }

  return {
    calendarId: defaultValues.calendarId,
    description: defaultValues.description ?? '',
    endAt: toDatetimeLocalValue(defaultValues.endAt),
    location: defaultValues.location ?? '',
    startAt: toDatetimeLocalValue(defaultValues.startAt),
    title: defaultValues.title,
  };
}

export function AgendaEventForm({ calendars, defaultValues, isDisabled = false, isSubmitting = false, onCancelEdit, onSubmitEvent }: AgendaEventFormProps) {
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<AgendaEventFormSchemaInput, undefined, AgendaEventFormSchemaOutput>({
    defaultValues: toFormValues(defaultValues),
    resolver: zodResolver(agendaEventFormSchema),
  });

  useEffect(() => {
    reset(toFormValues(defaultValues));
  }, [defaultValues, reset]);

  async function handleSubmitForm(values: AgendaEventFormSchemaOutput) {
    await onSubmitEvent(values, defaultValues?.id);
    reset(baseValues);
  }

  return (
    <form className={agendaEventFormStyles.form} onSubmit={handleSubmit(handleSubmitForm)}>
      <fieldset className={agendaEventFormStyles.fieldset} disabled={isDisabled || isSubmitting}>
        <div className={agendaEventFormStyles.field}>
          <label className={agendaEventFormStyles.label} htmlFor="agenda-calendar">Calendario</label>
          <select className={agendaEventFormStyles.select} id="agenda-calendar" {...register('calendarId')} disabled={Boolean(defaultValues) || isDisabled || isSubmitting}>
            <option value="">Selecione um calendario</option>
            {calendars.map((calendar) => (
              <option key={calendar.calendarId} value={calendar.calendarId}>{calendar.label}</option>
            ))}
          </select>
          {errors.calendarId ? <p className={agendaEventFormStyles.error}>{errors.calendarId.message}</p> : <p className={agendaEventFormStyles.helper}>A agenda operacional so permite criar em calendarios incluidos.</p>}
        </div>

        <div className={agendaEventFormStyles.grid}>
          <div className={agendaEventFormStyles.fieldWide}>
            <label className={agendaEventFormStyles.label} htmlFor="agenda-title">Titulo</label>
            <input className={agendaEventFormStyles.input} id="agenda-title" placeholder="Ex: Daily operacional" {...register('title')} />
            {errors.title ? <p className={agendaEventFormStyles.error}>{errors.title.message}</p> : <p className={agendaEventFormStyles.helper}>Use um titulo curto e claro para a leitura cronologica.</p>}
          </div>

          <div className={agendaEventFormStyles.field}>
            <label className={agendaEventFormStyles.label} htmlFor="agenda-start-at">Inicio</label>
            <input className={agendaEventFormStyles.input} id="agenda-start-at" type="datetime-local" {...register('startAt')} />
            {errors.startAt && <p className={agendaEventFormStyles.error}>{errors.startAt.message}</p>}
          </div>

          <div className={agendaEventFormStyles.field}>
            <label className={agendaEventFormStyles.label} htmlFor="agenda-end-at">Termino</label>
            <input className={agendaEventFormStyles.input} id="agenda-end-at" type="datetime-local" {...register('endAt')} />
            {errors.endAt && <p className={agendaEventFormStyles.error}>{errors.endAt.message}</p>}
          </div>

          <div className={agendaEventFormStyles.field}>
            <label className={agendaEventFormStyles.label} htmlFor="agenda-location">Local</label>
            <input className={agendaEventFormStyles.input} id="agenda-location" placeholder="Opcional" {...register('location')} />
            {errors.location ? <p className={agendaEventFormStyles.error}>{errors.location.message}</p> : <p className={agendaEventFormStyles.helper}>Use para sala, meet ou contexto operacional curto.</p>}
          </div>

          <div className={agendaEventFormStyles.fieldWide}>
            <label className={agendaEventFormStyles.label} htmlFor="agenda-description">Descricao</label>
            <textarea className={agendaEventFormStyles.textarea} id="agenda-description" placeholder="Opcional" {...register('description')} />
            {errors.description ? <p className={agendaEventFormStyles.error}>{errors.description.message}</p> : <p className={agendaEventFormStyles.helper}>A descricao pode ser curta. O primeiro corte privilegia a leitura cronologica.</p>}
          </div>
        </div>

        <div className={agendaEventFormStyles.footer}>
          <p className={agendaEventFormStyles.footerText}>
            {defaultValues
              ? 'A primeira entrega nao move eventos entre calendarios; a edicao preserva o calendario original.'
              : 'Crie eventos diretamente na agenda operacional para refletir o dia real sem sair do WorkCycle.'}
          </p>
          <div className={agendaEventFormStyles.actions}>
            <Button disabled={isDisabled || isSubmitting} onClick={onCancelEdit} type="button" variant="outline">Cancelar</Button>
            <Button disabled={isDisabled || isSubmitting} type="submit">{isSubmitting ? 'Salvando...' : defaultValues ? 'Salvar alteracoes' : 'Criar evento'}</Button>
          </div>
        </div>
      </fieldset>
    </form>
  );
}