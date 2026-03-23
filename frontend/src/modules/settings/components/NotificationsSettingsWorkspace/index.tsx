'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { getApiErrorMessage } from '@/lib/apiError';
import { useAuthStore } from '@/modules/auth/store/useAuthStore';
import { useNotificationCapability, useNotificationsStore } from '@/modules/notifications';
import { Button } from '@/shared/components/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/Card';
import { SectionIntro } from '@/shared/components/SectionIntro';
import { StateNotice } from '@/shared/components/StateNotice';

import { useUpdateUserSettingsMutation } from '@/modules/settings/queries/useUpdateUserSettingsMutation';
import { useUserSettingsQuery } from '@/modules/settings/queries/useUserSettingsQuery';
import type { UserSettingsDTO } from '@/modules/settings/types';

import {
  notificationsSettingsFormSchema,
  type NotificationsSettingsFormInput,
  type NotificationsSettingsFormOutput,
} from './schema';
import { notificationsSettingsWorkspaceStyles } from './styles';

import type { NotificationDegradedReason } from '@/modules/notifications';

function createFormValues(settings: UserSettingsDTO): NotificationsSettingsFormInput {
  return {
    cycleStartHour: settings.cycleStartHour,
    dailyReviewTime: settings.dailyReviewTime,
    notificationsEnabled: settings.notificationsEnabled,
    timezone: settings.timezone,
  };
}

function getCapabilityLabel(permission: ReturnType<typeof useNotificationCapability>['permission']) {
  if (permission === 'granted') {
    return 'Permissao concedida';
  }

  if (permission === 'denied') {
    return 'Permissao negada';
  }

  if (permission === 'default') {
    return 'Permissao pendente';
  }

  return 'Sem suporte no browser';
}

function getDegradedReasonLabel(reason: NotificationDegradedReason | null) {
  if (reason === 'browser-delivery-failed') {
    return 'O navegador falhou ao criar a notificacao do sistema e o motor caiu para in-app.';
  }

  if (reason === 'browser-permission-default') {
    return 'A permissao ainda nao foi concedida; o ambiente permanece em fallback in-app.';
  }

  if (reason === 'browser-permission-denied') {
    return 'O browser bloqueou notificacoes do sistema; apenas avisos in-app ficam disponiveis.';
  }

  if (reason === 'browser-unsupported') {
    return 'Este ambiente nao oferece Notification API; a experiencia fica restrita a avisos in-app.';
  }

  return null;
}

interface NotificationsSettingsWorkspaceProps {
  showIntro?: boolean;
}

export function NotificationsSettingsWorkspace({ showIntro = true }: NotificationsSettingsWorkspaceProps) {
  const session = useAuthStore((state) => state.session);
  const settingsQuery = useUserSettingsQuery({ enabled: Boolean(session) });
  const updateUserSettingsMutation = useUpdateUserSettingsMutation();
  const notificationCapability = useNotificationCapability({ enabled: Boolean(session) });
  const degradedReason = useNotificationsStore((state) => state.degradedReason);

  const {
    formState: { errors, isDirty },
    handleSubmit,
    register,
    reset,
  } = useForm<NotificationsSettingsFormInput, undefined, NotificationsSettingsFormOutput>({
    resolver: zodResolver(notificationsSettingsFormSchema),
    defaultValues: settingsQuery.data ? createFormValues(settingsQuery.data) : undefined,
  });

  useEffect(() => {
    if (!settingsQuery.data) {
      return;
    }

    reset(createFormValues(settingsQuery.data));
  }, [reset, settingsQuery.data]);

  if (!session) {
    return null;
  }

  const requestErrorMessage = settingsQuery.error || updateUserSettingsMutation.error
    ? getApiErrorMessage(settingsQuery.error ?? updateUserSettingsMutation.error, 'Nao foi possivel sincronizar as preferencias de notificacao agora.')
    : null;
  const degradedReasonLabel = getDegradedReasonLabel(degradedReason);

  async function handleSubmitSettings(values: NotificationsSettingsFormOutput) {
    await updateUserSettingsMutation.mutateAsync(values);
  }

  return (
    <div className={notificationsSettingsWorkspaceStyles.container}>
      {showIntro && (
        <SectionIntro
          eyebrow="Configuracoes"
          title="Notificacoes operacionais"
          description="Gerencie permissao e preferencias operacionais do motor. As notificacoes ativas e o historico recente ficam centralizados no drawer do header."
        />
      )}

      <Card>
        <CardHeader>
          <CardDescription>Preferencias persistidas</CardDescription>
          <CardTitle>Timezone, revisao diaria e motor de entrega</CardTitle>
        </CardHeader>
        <CardContent className={notificationsSettingsWorkspaceStyles.form}>
          {settingsQuery.isPending && (
            <StateNotice
              eyebrow="Sincronizacao"
              title="Carregando preferencias de notificacao"
              description="As preferencias persistidas estao sendo carregadas do backend autenticado."
              tone="info"
            />
          )}

          {requestErrorMessage && (
            <StateNotice
              eyebrow="Integracao"
              title="Falha ao sincronizar preferencias"
              description={requestErrorMessage}
              tone="warning"
            />
          )}

          {updateUserSettingsMutation.isSuccess && !updateUserSettingsMutation.isPending && (
            <StateNotice
              eyebrow="Preferencias salvas"
              title="Notificacoes atualizadas com sucesso"
              description="O backend confirmou as preferencias operacionais que alimentam o motor de notificacoes."
              tone="info"
            />
          )}

          <section className={notificationsSettingsWorkspaceStyles.environmentSection}>
            <div className={notificationsSettingsWorkspaceStyles.environmentHeader}>
              <div>
                <p className={notificationsSettingsWorkspaceStyles.label}>Ambiente atual</p>
                <h3 className={notificationsSettingsWorkspaceStyles.environmentTitle}>Capacidade do canal neste navegador</h3>
              </div>
              <p className={notificationsSettingsWorkspaceStyles.helper}>
                Avisos ativos e historico recente ficam no drawer de notificacoes do header.
              </p>
            </div>

            <div className={notificationsSettingsWorkspaceStyles.statusGrid}>
              <div className={notificationsSettingsWorkspaceStyles.statusCard}>
                <p className={notificationsSettingsWorkspaceStyles.statusLabel}>Permissao</p>
                <p className={notificationsSettingsWorkspaceStyles.statusValue}>{getCapabilityLabel(notificationCapability.permission)}</p>
              </div>
              <div className={notificationsSettingsWorkspaceStyles.statusCard}>
                <p className={notificationsSettingsWorkspaceStyles.statusLabel}>Canal atual</p>
                <p className={notificationsSettingsWorkspaceStyles.statusValue}>{notificationCapability.supportsBrowserNotification ? 'Browser + in-app' : 'Somente in-app'}</p>
              </div>
            </div>

            {degradedReasonLabel && (
              <StateNotice
                eyebrow="Estado degradado"
                title="O ambiente esta operando em fallback"
                description={degradedReasonLabel}
                tone="warning"
              />
            )}
          </section>

          {settingsQuery.data && (
            <form className={notificationsSettingsWorkspaceStyles.form} onSubmit={handleSubmit(handleSubmitSettings)}>
              <div className={notificationsSettingsWorkspaceStyles.formGrid}>
                <div className={notificationsSettingsWorkspaceStyles.fieldWide}>
                  <label className={notificationsSettingsWorkspaceStyles.label} htmlFor="notifications-timezone">Timezone operacional</label>
                  <input className={notificationsSettingsWorkspaceStyles.input} disabled={updateUserSettingsMutation.isPending} id="notifications-timezone" placeholder="Ex: America/Sao_Paulo" {...register('timezone')} />
                  {errors.timezone ? <p className={notificationsSettingsWorkspaceStyles.error}>{errors.timezone.message}</p> : <p className={notificationsSettingsWorkspaceStyles.helper}>Referencia canonica para revisao diaria e reconciliacoes do motor.</p>}
                </div>

                <div className={notificationsSettingsWorkspaceStyles.field}>
                  <label className={notificationsSettingsWorkspaceStyles.label} htmlFor="notifications-daily-review-time">Horario da revisao diaria</label>
                  <input className={notificationsSettingsWorkspaceStyles.input} disabled={updateUserSettingsMutation.isPending} id="notifications-daily-review-time" type="time" {...register('dailyReviewTime')} />
                  {errors.dailyReviewTime ? <p className={notificationsSettingsWorkspaceStyles.error}>{errors.dailyReviewTime.message}</p> : <p className={notificationsSettingsWorkspaceStyles.helper}>Lembrete diario usado pelo fluxo de recovery e revisao.</p>}
                </div>

                <div className={notificationsSettingsWorkspaceStyles.field}>
                  <label className={notificationsSettingsWorkspaceStyles.label} htmlFor="notifications-cycle-start-hour">Inicio do cycle</label>
                  <input className={notificationsSettingsWorkspaceStyles.input} disabled={updateUserSettingsMutation.isPending} id="notifications-cycle-start-hour" type="time" {...register('cycleStartHour')} />
                  {errors.cycleStartHour ? <p className={notificationsSettingsWorkspaceStyles.error}>{errors.cycleStartHour.message}</p> : <p className={notificationsSettingsWorkspaceStyles.helper}>Mantido aqui para evitar perda do ajuste operacional ja existente.</p>}
                </div>
              </div>

              <label className={notificationsSettingsWorkspaceStyles.checkboxRow} htmlFor="notifications-enabled">
                <div className={notificationsSettingsWorkspaceStyles.checkboxLabelWrap}>
                  <span className={notificationsSettingsWorkspaceStyles.label}>Notificacoes operacionais</span>
                  <span className={notificationsSettingsWorkspaceStyles.helper}>Ativa ou pausa o motor sem perder historico curto nem estado local do ambiente.</span>
                </div>
                <input className={notificationsSettingsWorkspaceStyles.checkbox} disabled={updateUserSettingsMutation.isPending} id="notifications-enabled" type="checkbox" {...register('notificationsEnabled')} />
              </label>

              <div className={notificationsSettingsWorkspaceStyles.actions}>
                <Button disabled={updateUserSettingsMutation.isPending || !isDirty} type="submit">
                  {updateUserSettingsMutation.isPending ? 'Salvando...' : 'Salvar preferencias'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}