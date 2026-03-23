'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarClock, CheckCircle2, Link2, RefreshCcw, Unplug } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'next/navigation';

import { getApiErrorMessage } from '@/lib/apiError';
import { useAuthStatusQuery } from '@/modules/auth/queries/useAuthStatusQuery';
import { useGoogleAccountsQuery } from '@/modules/auth/queries/useGoogleAccountsQuery';
import { useUpdateUserSettingsMutation } from '@/modules/auth/queries/useUpdateUserSettingsMutation';
import { useUserSettingsQuery } from '@/modules/auth/queries/useUserSettingsQuery';
import { useUpdateGoogleCalendarMutation } from '@/modules/auth/queries/useUpdateGoogleCalendarMutation';
import { authService } from '@/modules/auth/services/authService';
import { useAuthStore } from '@/modules/auth/store/useAuthStore';
import { Button } from '@/shared/components/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/Card';
import { EmptyState } from '@/shared/components/EmptyState';
import { SectionIntro } from '@/shared/components/SectionIntro';
import { StateNotice } from '@/shared/components/StateNotice';

import { authSettingsFormSchema, type AuthSettingsFormInput, type AuthSettingsFormOutput } from './schema';
import { authSettingsWorkspaceStyles } from './styles';

import type { GoogleAccountDTO, GoogleCalendarDTO, UserSettingsDTO } from '@/modules/auth/types';

function isAccountExpired(account: GoogleAccountDTO) {
  return Number.isFinite(Date.parse(account.tokenExpiresAt)) && Date.parse(account.tokenExpiresAt) <= Date.now();
}

function getAccountStatus(account: GoogleAccountDTO) {
  if (!account.isActive) {
    return {
      description: 'Essa conexao foi marcada como inativa no backend. Revise a integracao antes de depender dela no Modo Agenda.',
      eyebrow: 'Conta degradada',
      title: 'Esta conta precisa de atencao',
      tone: 'warning' as const,
    };
  }

  if (isAccountExpired(account)) {
    return {
      description: 'O token desta conta ja expirou. O vinculo continua salvo, mas a sincronizacao dependera de reconexao ou refresh no backend.',
      eyebrow: 'Token expirado',
      title: 'Reconecte esta conta para manter os calendarios atualizados',
      tone: 'warning' as const,
    };
  }

  return null;
}

function createFormValues(settings: UserSettingsDTO): AuthSettingsFormInput {
  return {
    cycleStartHour: settings.cycleStartHour,
    dailyReviewTime: settings.dailyReviewTime,
    notificationsEnabled: settings.notificationsEnabled,
    timezone: settings.timezone,
  };
}

function formatDateTimeByTimezone(value: string | null, timezone: string) {
  if (!value) {
    return 'ainda nao sincronizado';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: timezone,
  }).format(new Date(value));
}

interface OperationalSettingsFormProps {
  isDisabled: boolean;
  isSubmitting: boolean;
  onSubmitSettings: (values: AuthSettingsFormOutput) => Promise<void>;
  settings: UserSettingsDTO;
}

function OperationalSettingsForm({ isDisabled, isSubmitting, onSubmitSettings, settings }: OperationalSettingsFormProps) {
  const {
    formState: { errors, isDirty },
    handleSubmit,
    register,
    reset,
  } = useForm<AuthSettingsFormInput, undefined, AuthSettingsFormOutput>({
    resolver: zodResolver(authSettingsFormSchema),
    defaultValues: createFormValues(settings),
  });

  useEffect(() => {
    reset(createFormValues(settings));
  }, [reset, settings]);

  return (
    <form className={authSettingsWorkspaceStyles.form} onSubmit={handleSubmit(onSubmitSettings)}>
      <div className={authSettingsWorkspaceStyles.formGrid}>
        <div className={authSettingsWorkspaceStyles.fieldWide}>
          <label className={authSettingsWorkspaceStyles.label} htmlFor="settings-timezone">Timezone operacional</label>
          <input className={authSettingsWorkspaceStyles.input} disabled={isDisabled} id="settings-timezone" placeholder="Ex: America/Sao_Paulo" {...register('timezone')} />
          {errors.timezone ? <p className={authSettingsWorkspaceStyles.error}>{errors.timezone.message}</p> : <p className={authSettingsWorkspaceStyles.helper}>Esse timezone passa a ser a referencia canônica das regras compartilhadas do produto.</p>}
        </div>

        <div className={authSettingsWorkspaceStyles.field}>
          <label className={authSettingsWorkspaceStyles.label} htmlFor="settings-daily-review-time">Horario da revisao diaria</label>
          <input className={authSettingsWorkspaceStyles.input} disabled={isDisabled} id="settings-daily-review-time" type="time" {...register('dailyReviewTime')} />
          {errors.dailyReviewTime ? <p className={authSettingsWorkspaceStyles.error}>{errors.dailyReviewTime.message}</p> : <p className={authSettingsWorkspaceStyles.helper}>Base para o lembrete operacional diario.</p>}
        </div>

        <div className={authSettingsWorkspaceStyles.field}>
          <label className={authSettingsWorkspaceStyles.label} htmlFor="settings-cycle-start-hour">Inicio do cycle</label>
          <input className={authSettingsWorkspaceStyles.input} disabled={isDisabled} id="settings-cycle-start-hour" type="time" {...register('cycleStartHour')} />
          {errors.cycleStartHour ? <p className={authSettingsWorkspaceStyles.error}>{errors.cycleStartHour.message}</p> : <p className={authSettingsWorkspaceStyles.helper}>Boundary operacional que os proximos tickets vao consolidar no backend.</p>}
        </div>
      </div>

      <label className={authSettingsWorkspaceStyles.checkboxRow} htmlFor="settings-notifications-enabled">
        <div className={authSettingsWorkspaceStyles.checkboxLabelWrap}>
          <span className={authSettingsWorkspaceStyles.label}>Notificacoes operacionais</span>
          <span className={authSettingsWorkspaceStyles.helper}>Pausa ou reativa os lembretes sem perder o restante das preferencias persistidas.</span>
        </div>
        <input className={authSettingsWorkspaceStyles.checkbox} disabled={isDisabled} id="settings-notifications-enabled" type="checkbox" {...register('notificationsEnabled')} />
      </label>

      <div className={authSettingsWorkspaceStyles.actions}>
        <Button disabled={isDisabled || !isDirty || isSubmitting} type="submit">
          {isSubmitting ? 'Salvando...' : 'Salvar preferencias'}
        </Button>
      </div>
    </form>
  );
}

export function AuthSettingsWorkspace() {
  const searchParams = useSearchParams();
  const session = useAuthStore((state) => state.session);
  const authStatusQuery = useAuthStatusQuery();
  const settingsQuery = useUserSettingsQuery({ enabled: Boolean(session) });
  const googleAccountsQuery = useGoogleAccountsQuery({ enabled: Boolean(session) });
  const updateUserSettingsMutation = useUpdateUserSettingsMutation();
  const updateGoogleCalendarMutation = useUpdateGoogleCalendarMutation();
  const [pendingCalendarId, setPendingCalendarId] = useState<string | null>(null);

  async function handleLinkGoogle() {
    const response = await authService.getGoogleLinkUrl();

    window.location.assign(response.url);
  }

  async function handleToggleCalendar(calendar: GoogleCalendarDTO) {
    setPendingCalendarId(calendar.id);

    try {
      await updateGoogleCalendarMutation.mutateAsync({
        calendarId: calendar.id,
        isIncluded: !calendar.isIncluded,
      });
    } finally {
      setPendingCalendarId(null);
    }
  }

  if (!session) {
    return null;
  }

  const googleAccounts = googleAccountsQuery.data ?? [];
  const googleWasLinkedNow = searchParams?.get('google') === 'linked';
  const settings = settingsQuery.data ?? null;
  const requestError = settingsQuery.error ?? updateUserSettingsMutation.error ?? googleAccountsQuery.error;
  const requestErrorMessage = requestError
    ? getApiErrorMessage(requestError, 'Nao foi possivel sincronizar as configuracoes persistidas agora.')
    : null;

  async function handleSubmitSettings(values: AuthSettingsFormOutput) {
    await updateUserSettingsMutation.mutateAsync(values);
  }

  return (
    <div className={authSettingsWorkspaceStyles.container}>
      <SectionIntro
        eyebrow="Configuracoes"
        title="Conta, seguranca e integracao Google"
        description="Quem entrou por email continua operando normalmente e pode conectar o Google depois. O workspace tambem persiste timezone e horarios-base que sustentam os proximos fluxos operacionais."
      />

      {googleWasLinkedNow && (
        <StateNotice
          eyebrow="Google conectado"
          title="Sua conta Google foi vinculada com sucesso"
          description="A sessao atual continua valida e o calendario ja pode ser tratado como extensao da sua conta WorkCycle."
          tone="info"
        />
      )}

      <div className={authSettingsWorkspaceStyles.cardStack}>
        <Card>
          <CardHeader>
            <CardDescription>Perfil</CardDescription>
            <CardTitle>Dados da sessao autenticada</CardTitle>
          </CardHeader>
          <CardContent className={authSettingsWorkspaceStyles.profileList}>
            <div className={authSettingsWorkspaceStyles.row}>
              <div>
                <p className={authSettingsWorkspaceStyles.label}>Nome</p>
                <p className={authSettingsWorkspaceStyles.value}>{session.user.displayName}</p>
              </div>
            </div>
            <div className={authSettingsWorkspaceStyles.row}>
              <div>
                <p className={authSettingsWorkspaceStyles.label}>Email</p>
                <p className={authSettingsWorkspaceStyles.value}>{session.user.email}</p>
              </div>
            </div>
            <div className={authSettingsWorkspaceStyles.row}>
              <div>
                <p className={authSettingsWorkspaceStyles.label}>Origem de auth</p>
                <p className={authSettingsWorkspaceStyles.value}>{session.user.authProvider}</p>
              </div>
            </div>
            <p className={authSettingsWorkspaceStyles.hint}>
              Se a conta nasceu por email, voce pode anexar o Google aqui sem recriar usuario nem perder historico.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Preferencias operacionais</CardDescription>
            <CardTitle>Timezone, revisao diaria e boundary do cycle</CardTitle>
          </CardHeader>
          <CardContent className={authSettingsWorkspaceStyles.connections}>
            {settingsQuery.isPending && (
              <StateNotice
                eyebrow="Sincronizacao"
                title="Carregando preferencias persistidas"
                description="As configuracoes operacionais autenticadas estao sendo recuperadas do backend."
                tone="info"
              />
            )}

            {settingsQuery.isRefetching && !settingsQuery.isPending && (
              <StateNotice
                eyebrow="Sincronizacao"
                title="Atualizando preferencias persistidas"
                description="A tela esta reconciliando os valores mais recentes confirmados pelo backend."
                tone="info"
              />
            )}

            {requestErrorMessage && (
              <StateNotice
                eyebrow="Integracao"
                title="Falha ao sincronizar configuracoes"
                description={requestErrorMessage}
                tone="warning"
              />
            )}

            {updateUserSettingsMutation.isSuccess && !updateUserSettingsMutation.isPending && (
              <StateNotice
                eyebrow="Preferencias salvas"
                title="Configuracoes persistidas com sucesso"
                description="O backend confirmou o novo timezone e os horarios-base operacionais."
                tone="info"
              />
            )}

            {settings && (
              <>
                <div className={authSettingsWorkspaceStyles.row}>
                  <div>
                    <p className={authSettingsWorkspaceStyles.label}>Vinculo Google no contexto de Settings</p>
                    <p className={authSettingsWorkspaceStyles.value}>{settings.googleConnection.hasGoogleLinked ? 'Google conectado' : 'Sem Google conectado'}</p>
                    <p className={authSettingsWorkspaceStyles.hint}>
                      {settings.googleConnection.connectedAccountCount} conta(s) conectada(s) · vinculo {settings.googleConnection.linkedAt ? `registrado em ${formatDateTimeByTimezone(settings.googleConnection.linkedAt, settings.timezone)}` : 'ainda nao registrado'}
                    </p>
                  </div>
                </div>

                <OperationalSettingsForm
                  isDisabled={settingsQuery.isRefetching || updateUserSettingsMutation.isPending}
                  isSubmitting={updateUserSettingsMutation.isPending}
                  onSubmitSettings={handleSubmitSettings}
                  settings={settings}
                />
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Google</CardDescription>
            <CardTitle>Contas conectadas e calendarios operacionais</CardTitle>
          </CardHeader>
          <CardContent className={authSettingsWorkspaceStyles.connections}>
            {!authStatusQuery.data?.oauthConfigured && (
              <StateNotice
                eyebrow="OAuth pendente"
                title="A configuracao Google ainda nao foi habilitada no backend"
                description="Assim que as credenciais OAuth estiverem preenchidas no ambiente, o botao abaixo passa a abrir o fluxo de conexao real."
                tone="warning"
              />
            )}

            {googleAccountsQuery.isError ? (
              <StateNotice
                eyebrow="Integracoes indisponiveis"
                title="Nao foi possivel carregar as contas Google agora"
                description="A vinculacao continua preservada, mas a leitura das integracoes falhou nesta tentativa. Tente novamente apos estabilizar a API." 
                tone="warning"
              />
            ) : googleAccounts.length > 0 ? (
              <div className={authSettingsWorkspaceStyles.connections}>
                {googleAccounts.map((account) => (
                  <section className={authSettingsWorkspaceStyles.accountCard} key={account.id}>
                    <div className={authSettingsWorkspaceStyles.accountHeader}>
                      <div className={authSettingsWorkspaceStyles.accountHeaderMeta}>
                        <div>
                          <p className={authSettingsWorkspaceStyles.label}>Conta vinculada</p>
                          <p className={authSettingsWorkspaceStyles.value}>{account.displayName}</p>
                          <p className={authSettingsWorkspaceStyles.hint}>{account.email}</p>
                        </div>
                        <p className={authSettingsWorkspaceStyles.accountStatus}>
                          {account.calendars.length} calendario{account.calendars.length === 1 ? '' : 's'} conectado{account.calendars.length === 1 ? '' : 's'}
                        </p>
                      </div>
                      <CalendarClock aria-hidden="true" className="mt-1 h-5 w-5 text-cyan-700" />
                    </div>

                    {getAccountStatus(account) && (
                      <StateNotice
                        eyebrow={getAccountStatus(account)?.eyebrow ?? 'Conta degradada'}
                        title={getAccountStatus(account)?.title ?? 'Conta degradada'}
                        description={getAccountStatus(account)?.description ?? ''}
                        tone={getAccountStatus(account)?.tone ?? 'warning'}
                      />
                    )}

                    {account.calendars.length > 0 ? (
                      <div className={authSettingsWorkspaceStyles.calendarsList}>
                        {account.calendars.map((calendar) => {
                          const isPending = pendingCalendarId === calendar.id && updateGoogleCalendarMutation.isPending;

                          return (
                            <div className={authSettingsWorkspaceStyles.calendarRow} key={calendar.id}>
                              <div className={authSettingsWorkspaceStyles.calendarMeta}>
                                <div className={authSettingsWorkspaceStyles.calendarNameRow}>
                                  <span className={authSettingsWorkspaceStyles.calendarDot} style={{ backgroundColor: calendar.colorHex }} />
                                  <p className={authSettingsWorkspaceStyles.calendarTitle}>{calendar.name}</p>
                                  {calendar.isPrimary && <span className={authSettingsWorkspaceStyles.calendarBadge}>Primary</span>}
                                  {calendar.isIncluded && <span className={authSettingsWorkspaceStyles.calendarBadge}>Incluido</span>}
                                </div>
                                <p className={authSettingsWorkspaceStyles.hint}>
                                  {calendar.isIncluded
                                    ? 'Este calendario ja alimenta a agenda operacional do WorkCycle.'
                                    : 'Este calendario esta salvo, mas nao entra na agenda operacional enquanto permanecer excluido.'}
                                </p>
                                <p className={authSettingsWorkspaceStyles.hint}>
                                  Ultimo sync: {formatDateTimeByTimezone(calendar.syncedAt, settings?.timezone ?? 'UTC')}
                                </p>
                              </div>
                              <div className={authSettingsWorkspaceStyles.calendarAction}>
                                <Button
                                  disabled={isPending}
                                  onClick={() => void handleToggleCalendar(calendar)}
                                  size="sm"
                                  type="button"
                                  variant={calendar.isIncluded ? 'outline' : 'default'}
                                >
                                  {calendar.isIncluded ? (
                                    <Unplug aria-hidden="true" className="mr-2 h-4 w-4" />
                                  ) : (
                                    <CheckCircle2 aria-hidden="true" className="mr-2 h-4 w-4" />
                                  )}
                                  {isPending ? 'Atualizando...' : calendar.isIncluded ? 'Excluir da agenda' : 'Incluir na agenda'}
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <StateNotice
                        eyebrow="Sem calendarios"
                        title="Esta conta ainda nao retornou calendarios conectados"
                        description="O vinculo da conta existe, mas nenhum calendario foi disponibilizado para uso operacional ate agora."
                        tone="warning"
                      />
                    )}
                  </section>
                ))}
              </div>
            ) : (
              <EmptyState
                eyebrow="Nenhuma vinculacao"
                title="Sua conta ainda nao tem Google conectado"
                description="Conecte o Google para habilitar login opcional por OAuth e preparar integracao com calendarios."
                hint="O mesmo usuario continua sendo usado; a conexao so adiciona um provedor complementar."
              />
            )}

            <Button disabled={!authStatusQuery.data?.oauthConfigured} onClick={() => void handleLinkGoogle()} size="lg" type="button">
              <Link2 aria-hidden="true" className="mr-2 h-4.5 w-4.5" />
              Conectar Google
            </Button>

            {googleAccountsQuery.isFetching && googleAccounts.length > 0 && (
              <p className={authSettingsWorkspaceStyles.hint}>
                <RefreshCcw aria-hidden="true" className="mr-2 inline h-4 w-4" />
                Atualizando integracoes Google...
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}