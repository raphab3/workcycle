'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { TestTube2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import { getApiErrorMessage } from '@/lib/apiError';
import { useAuthStore } from '@/modules/auth/store/useAuthStore';
import { useNotificationCapability, useNotificationsStore } from '@/modules/notifications';
import { Button } from '@/shared/components/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/Card';
import { EmptyState } from '@/shared/components/EmptyState';
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

import type { DeliveryDecision, NotificationDegradedReason, OperationalNotificationEvent, ReminderHistoryItem } from '@/modules/notifications';

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

function getDecisionPreviewLabel(decision: DeliveryDecision | null) {
  if (!decision) {
    return 'Nenhum teste executado ainda.';
  }

  if (decision.channel === 'browser') {
    return 'O motor entregaria via notificacao do navegador neste contexto.';
  }

  if (decision.channel === 'in-app') {
    return 'O motor entregaria um aviso in-app neste contexto.';
  }

  if (decision.channel === 'suppressed') {
    return 'O motor suprimiu a entrega com base na politica atual.';
  }

  return 'O motor marcou o evento para recovery em vez de entrega imediata.';
}

function formatHistoryStatus(item: ReminderHistoryItem) {
  if (item.status === 'shown') {
    return 'Exibido';
  }

  if (item.status === 'suppressed') {
    return 'Suprimido';
  }

  if (item.status === 'resolved') {
    return 'Resolvido';
  }

  return 'Perdido';
}

function createPreviewEvent(): OperationalNotificationEvent {
  const occurredAt = new Date().toISOString();

  return {
    context: {
      sourceType: 'settings-preview',
    },
    eventId: `settings-preview:${occurredAt}`,
    expiresAt: new Date(Date.now() + 10 * 60_000).toISOString(),
    message: 'Este preview usa a politica real do motor de notificacoes no ambiente atual.',
    occurredAt,
    title: 'Preview de notificacoes operacionais',
    type: 'activity-pulse-due',
  };
}

export function NotificationsSettingsWorkspace() {
  const session = useAuthStore((state) => state.session);
  const settingsQuery = useUserSettingsQuery({ enabled: Boolean(session) });
  const updateUserSettingsMutation = useUpdateUserSettingsMutation();
  const notificationCapability = useNotificationCapability({ enabled: Boolean(session) });
  const dispatchEvent = useNotificationsStore((state) => state.dispatchEvent);
  const activeInAppNotification = useNotificationsStore((state) => state.activeInAppNotification);
  const degradedReason = useNotificationsStore((state) => state.degradedReason);
  const lastDeliveryDecision = useNotificationsStore((state) => state.lastDeliveryDecision);
  const reminderHistory = useNotificationsStore((state) => state.reminderHistory);
  const [previewFeedback, setPreviewFeedback] = useState<string | null>(null);
  const recentHistory = useMemo(() => reminderHistory.slice(0, 5), [reminderHistory]);

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

  function handlePreviewNotification() {
    const decision = dispatchEvent(createPreviewEvent(), notificationCapability);

    setPreviewFeedback(getDecisionPreviewLabel(decision));
  }

  return (
    <div className={notificationsSettingsWorkspaceStyles.container}>
      <SectionIntro
        eyebrow="Configuracoes"
        title="Notificacoes operacionais"
        description="Gerencie permissao, preferencias operacionais e um preview coerente com o motor real de entrega, sem misturar isso com conta ou Google."
      />

      <div className={notificationsSettingsWorkspaceStyles.cardStack}>
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
                  <Button onClick={handlePreviewNotification} type="button" variant="outline">
                    <TestTube2 aria-hidden="true" className="mr-2 h-4 w-4" />
                    Testar notificacao
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        <div className={notificationsSettingsWorkspaceStyles.cardStack}>
          <Card>
            <CardHeader>
              <CardDescription>Ambiente atual</CardDescription>
              <CardTitle>Capacidade e estado degradado</CardTitle>
            </CardHeader>
            <CardContent className={notificationsSettingsWorkspaceStyles.statusGrid}>
              <div className={notificationsSettingsWorkspaceStyles.statusCard}>
                <p className={notificationsSettingsWorkspaceStyles.statusLabel}>Permissao</p>
                <p className={notificationsSettingsWorkspaceStyles.statusValue}>{getCapabilityLabel(notificationCapability.permission)}</p>
              </div>
              <div className={notificationsSettingsWorkspaceStyles.statusCard}>
                <p className={notificationsSettingsWorkspaceStyles.statusLabel}>Canal atual</p>
                <p className={notificationsSettingsWorkspaceStyles.statusValue}>{notificationCapability.supportsBrowserNotification ? 'Browser + in-app' : 'Somente in-app'}</p>
              </div>

              {degradedReasonLabel && (
                <div className={notificationsSettingsWorkspaceStyles.fieldWide}>
                  <StateNotice
                    eyebrow="Estado degradado"
                    title="O ambiente esta operando em fallback"
                    description={degradedReasonLabel}
                    tone="warning"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Preview</CardDescription>
              <CardTitle>Resultado do motor no contexto atual</CardTitle>
            </CardHeader>
            <CardContent className={notificationsSettingsWorkspaceStyles.previewCard}>
              <div>
                <p className={notificationsSettingsWorkspaceStyles.previewTitle}>Decisao mais recente</p>
                <p className={notificationsSettingsWorkspaceStyles.previewText}>{previewFeedback ?? getDecisionPreviewLabel(lastDeliveryDecision)}</p>
              </div>

              {activeInAppNotification ? (
                <div className={notificationsSettingsWorkspaceStyles.statusCard}>
                  <p className={notificationsSettingsWorkspaceStyles.statusLabel}>Aviso in-app ativo</p>
                  <p className={notificationsSettingsWorkspaceStyles.statusValue}>{activeInAppNotification.title}</p>
                  <p className={notificationsSettingsWorkspaceStyles.previewText}>{activeInAppNotification.message}</p>
                </div>
              ) : (
                <EmptyState
                  eyebrow="Preview"
                  title="Nenhum aviso in-app ativo"
                  description="Execute o teste para ver como o motor se comporta com a permissao e o foco atuais."
                  hint="Se o canal preferido for browser, o preview nao precisa manter um card in-app aberto."
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Historico curto</CardDescription>
              <CardTitle>Ultimos lembretes reconciliados</CardTitle>
            </CardHeader>
            <CardContent className={notificationsSettingsWorkspaceStyles.historyList}>
              {recentHistory.length > 0 ? recentHistory.map((item) => (
                <div className={notificationsSettingsWorkspaceStyles.historyItem} key={item.eventId}>
                  <p className={notificationsSettingsWorkspaceStyles.previewTitle}>{item.contextLabel ?? item.type}</p>
                  <p className={notificationsSettingsWorkspaceStyles.previewText}>{formatHistoryStatus(item)}</p>
                  <p className={notificationsSettingsWorkspaceStyles.historyMeta}>{new Date(item.occurredAt).toLocaleString('pt-BR')}</p>
                </div>
              )) : (
                <EmptyState
                  eyebrow="Historico"
                  title="Nenhum lembrete recente ainda"
                  description="O historico curto aparece aqui conforme o motor entrega, suprime ou recupera notificacoes recentes."
                  hint="Esse recorte e local e explicativo; nao representa um inbox completo."
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}