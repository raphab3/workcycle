'use client';

import { CalendarClock, CheckCircle2, Link2, RefreshCcw, Unplug } from 'lucide-react';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { getApiErrorMessage } from '@/lib/apiError';
import { useAuthStatusQuery } from '@/modules/auth/queries/useAuthStatusQuery';
import { useGoogleAccountsQuery } from '@/modules/auth/queries/useGoogleAccountsQuery';
import { useUpdateGoogleCalendarMutation } from '@/modules/auth/queries/useUpdateGoogleCalendarMutation';
import { authService } from '@/modules/auth/services/authService';
import { useAuthStore } from '@/modules/auth/store/useAuthStore';
import { useUserSettingsQuery } from '@/modules/settings';
import { Button } from '@/shared/components/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/Card';
import { EmptyState } from '@/shared/components/EmptyState';
import { SectionIntro } from '@/shared/components/SectionIntro';
import { StateNotice } from '@/shared/components/StateNotice';

import { googleCalendarSettingsWorkspaceStyles } from './styles';

import type { GoogleAccountDTO, GoogleCalendarDTO } from '@/modules/auth/types';

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

interface GoogleCalendarSettingsWorkspaceProps {
  showIntro?: boolean;
}

export function GoogleCalendarSettingsWorkspace({ showIntro = true }: GoogleCalendarSettingsWorkspaceProps) {
  const searchParams = useSearchParams();
  const session = useAuthStore((state) => state.session);
  const authStatusQuery = useAuthStatusQuery();
  const settingsQuery = useUserSettingsQuery({ enabled: Boolean(session) });
  const googleAccountsQuery = useGoogleAccountsQuery({ enabled: Boolean(session) });
  const updateGoogleCalendarMutation = useUpdateGoogleCalendarMutation();
  const [pendingCalendarId, setPendingCalendarId] = useState<string | null>(null);

  async function handleLinkGoogleCalendar() {
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
  const hasLinkedGoogleAccounts = googleAccounts.length > 0;
  const requestError = settingsQuery.error ?? googleAccountsQuery.error;
  const requestErrorMessage = requestError
    ? getApiErrorMessage(requestError, 'Nao foi possivel sincronizar os metadados da conta agora.')
    : null;

  return (
    <div className={googleCalendarSettingsWorkspaceStyles.container}>
      {showIntro && (
        <SectionIntro
          eyebrow="Google"
          title="Google Calendar operacional"
          description="Esta area gerencia contas conectadas, reconexao de permissoes e os calendarios que entram na agenda operacional. O login da conta WorkCycle fica separado."
        />
      )}

      {googleWasLinkedNow && (
        <StateNotice
          eyebrow="Conta conectada"
          title="Uma conta Google Calendar foi vinculada com sucesso"
          description="A sessao atual continua valida e a nova conta ja pode ser tratada como fonte operacional independente dentro do WorkCycle."
          tone="info"
        />
      )}

      <Card>
        <CardHeader>
          <CardDescription>Google Calendar</CardDescription>
          <CardTitle>Contas conectadas e calendarios operacionais</CardTitle>
        </CardHeader>
        <CardContent className={googleCalendarSettingsWorkspaceStyles.connections}>
          {settingsQuery.isPending && (
            <StateNotice
              eyebrow="Sincronizacao"
              title="Carregando metadados da conta"
              description="O backend ainda esta reconciliando o vinculo Google e o timezone usado para formatar os horarios desta tela."
              tone="info"
            />
          )}

          {requestErrorMessage && (
            <StateNotice
              eyebrow="Integracao"
              title="Falha ao sincronizar os dados da conta"
              description={requestErrorMessage}
              tone="warning"
            />
          )}

          {!authStatusQuery.data?.oauthConfigured && (
            <StateNotice
              eyebrow="OAuth pendente"
              title="A configuracao Google ainda nao foi habilitada no backend"
              description="Assim que as credenciais OAuth estiverem preenchidas no ambiente, o botao abaixo passa a abrir o fluxo de conexao real."
              tone="warning"
            />
          )}

          {authStatusQuery.data?.oauthConfigured && hasLinkedGoogleAccounts && (
            <StateNotice
              eyebrow="Permissao ampliada"
              title="Reautorize as contas que precisarem de escrita no Google Calendar"
              description="Use o fluxo abaixo para conectar outra conta Google Calendar ou renovar o consentimento das contas ja vinculadas com permissao de criacao, edicao e exclusao."
              tone="info"
            />
          )}

          {googleAccountsQuery.isError ? (
            <StateNotice
              eyebrow="Integracoes indisponiveis"
              title="Nao foi possivel carregar as contas Google agora"
              description="A vinculacao continua preservada, mas a leitura das integracoes falhou nesta tentativa. Tente novamente apos estabilizar a API."
              tone="warning"
            />
          ) : hasLinkedGoogleAccounts ? (
            <div className={googleCalendarSettingsWorkspaceStyles.connections}>
              {googleAccounts.map((account) => {
                const accountStatus = getAccountStatus(account);

                return (
                  <section className={googleCalendarSettingsWorkspaceStyles.accountCard} key={account.id}>
                    <div className={googleCalendarSettingsWorkspaceStyles.accountHeader}>
                      <div className={googleCalendarSettingsWorkspaceStyles.accountHeaderMeta}>
                        <div>
                          <p className={googleCalendarSettingsWorkspaceStyles.label}>Conta vinculada</p>
                          <p className={googleCalendarSettingsWorkspaceStyles.value}>{account.displayName}</p>
                          <p className={googleCalendarSettingsWorkspaceStyles.hint}>{account.email}</p>
                        </div>
                        <p className={googleCalendarSettingsWorkspaceStyles.accountStatus}>
                          {account.calendars.length} calendario{account.calendars.length === 1 ? '' : 's'} conectado{account.calendars.length === 1 ? '' : 's'}
                        </p>
                      </div>
                      <CalendarClock aria-hidden="true" className="mt-1 h-5 w-5 text-cyan-700" />
                    </div>

                    {accountStatus && (
                      <StateNotice
                        eyebrow={accountStatus.eyebrow}
                        title={accountStatus.title}
                        description={accountStatus.description}
                        tone={accountStatus.tone}
                      />
                    )}

                    {account.calendars.length > 0 ? (
                      <div className={googleCalendarSettingsWorkspaceStyles.calendarsList}>
                        {account.calendars.map((calendar) => {
                          const isPending = pendingCalendarId === calendar.id && updateGoogleCalendarMutation.isPending;

                          return (
                            <div className={googleCalendarSettingsWorkspaceStyles.calendarRow} key={calendar.id}>
                              <div className={googleCalendarSettingsWorkspaceStyles.calendarMeta}>
                                <div className={googleCalendarSettingsWorkspaceStyles.calendarNameRow}>
                                  <span className={googleCalendarSettingsWorkspaceStyles.calendarDot} style={{ backgroundColor: calendar.colorHex }} />
                                  <p className={googleCalendarSettingsWorkspaceStyles.calendarTitle}>{calendar.name}</p>
                                  {calendar.isPrimary && <span className={googleCalendarSettingsWorkspaceStyles.calendarBadge}>Primary</span>}
                                  {calendar.isIncluded && <span className={googleCalendarSettingsWorkspaceStyles.calendarBadge}>Incluido</span>}
                                </div>
                                <p className={googleCalendarSettingsWorkspaceStyles.hint}>
                                  {calendar.isIncluded
                                    ? 'Este calendario ja alimenta a agenda operacional do WorkCycle.'
                                    : 'Este calendario esta salvo, mas nao entra na agenda operacional enquanto permanecer excluido.'}
                                </p>
                                <p className={googleCalendarSettingsWorkspaceStyles.hint}>
                                  Ultimo sync: {formatDateTimeByTimezone(calendar.syncedAt, settings?.timezone ?? 'UTC')}
                                </p>
                              </div>
                              <div className={googleCalendarSettingsWorkspaceStyles.calendarAction}>
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
                );
              })}
            </div>
          ) : (
            <EmptyState
              eyebrow="Nenhuma vinculacao"
              title="Nenhuma conta Google Calendar conectada"
              description="Conecte a primeira conta Google Calendar para escolher quais calendarios entram na agenda operacional."
              hint="O login do WorkCycle continua o mesmo; esta conexao so adiciona uma fonte externa de calendario."
            />
          )}

          <div className={googleCalendarSettingsWorkspaceStyles.actionRow}>
            <Button disabled={!authStatusQuery.data?.oauthConfigured} onClick={() => void handleLinkGoogleCalendar()} size="lg" type="button">
              <Link2 aria-hidden="true" className="mr-2 h-4.5 w-4.5" />
              {hasLinkedGoogleAccounts ? 'Conectar outra conta Google Calendar' : 'Conectar primeira conta Google Calendar'}
            </Button>
            <p className={googleCalendarSettingsWorkspaceStyles.hint}>
              O mesmo fluxo tambem serve para reconectar uma conta degradada ou renovar permissoes de escrita quando necessario.
            </p>
          </div>

          {googleAccountsQuery.isFetching && hasLinkedGoogleAccounts && (
            <p className={googleCalendarSettingsWorkspaceStyles.hint}>
              <RefreshCcw aria-hidden="true" className="mr-2 inline h-4 w-4" />
              Atualizando integracoes Google...
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}