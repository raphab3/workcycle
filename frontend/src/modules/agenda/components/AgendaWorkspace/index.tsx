'use client';

import { Plus, RefreshCcw } from 'lucide-react';
import { useMemo, useState } from 'react';

import { getApiErrorMessage } from '@/lib/apiError';
import { useGoogleAccountsQuery } from '@/modules/auth/queries/useGoogleAccountsQuery';
import { useAuthStore } from '@/modules/auth/store/useAuthStore';
import { useCreateAgendaEventMutation } from '@/modules/agenda/queries/useCreateAgendaEventMutation';
import { useAgendaEventsQuery } from '@/modules/agenda/queries/useAgendaEventsQuery';
import { useDeleteAgendaEventMutation } from '@/modules/agenda/queries/useDeleteAgendaEventMutation';
import { useRefreshAgendaMutation } from '@/modules/agenda/queries/useRefreshAgendaMutation';
import { useRespondAgendaEventMutation } from '@/modules/agenda/queries/useRespondAgendaEventMutation';
import { useUpdateAgendaEventMutation } from '@/modules/agenda/queries/useUpdateAgendaEventMutation';
import { buildAgendaDayInterval, countUniqueAgendaCalendars, formatAgendaDateTime, formatAgendaDayLabel, formatAgendaTimeRange, getAgendaGuestSummary, getAgendaResponseActions, getAgendaResponseStatusLabel, getIncludedAgendaCalendars, getLocalISODate, shiftAgendaDate, sortAgendaEvents, toAgendaEventWritePayload } from '@/modules/agenda/utils/agenda';
import { Button } from '@/shared/components/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/Card';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog/index';
import { EmptyState } from '@/shared/components/EmptyState';
import { OverlayPanel } from '@/shared/components/OverlayPanel/index';
import { SectionIntro } from '@/shared/components/SectionIntro';
import { StateNotice } from '@/shared/components/StateNotice';
import { cn } from '@/shared/utils/cn';

import { AgendaEventForm } from '../AgendaEventForm/index';
import { agendaWorkspaceStyles } from './styles';

import type { AgendaEvent, AgendaEventFormValues, AgendaEventResponseStatus } from '@/modules/agenda/types';

interface PendingResponseAction {
  confirmLabel: string;
  description: string;
  event: AgendaEvent;
  nextStatus: AgendaEventResponseStatus;
  title: string;
}

export function AgendaWorkspace() {
  const [selectedDate, setSelectedDate] = useState(() => getLocalISODate(new Date()));
  const [editingEvent, setEditingEvent] = useState<AgendaEvent | null>(null);
  const [isEventPanelOpen, setIsEventPanelOpen] = useState(false);
  const [pendingResponseAction, setPendingResponseAction] = useState<PendingResponseAction | null>(null);
  const [pendingDeleteEvent, setPendingDeleteEvent] = useState<AgendaEvent | null>(null);
  const hasHydratedSession = useAuthStore((state) => state.hasHydrated);
  const sessionStatus = useAuthStore((state) => state.sessionStatus);
  const isAuthLoading = !hasHydratedSession;
  const isAuthenticated = hasHydratedSession && sessionStatus === 'authenticated';
  const interval = useMemo(() => buildAgendaDayInterval(selectedDate), [selectedDate]);
  const agendaEventsQuery = useAgendaEventsQuery({ enabled: isAuthenticated, ...interval });
  const googleAccountsQuery = useGoogleAccountsQuery({ enabled: isAuthenticated });
  const createAgendaEventMutation = useCreateAgendaEventMutation(interval);
  const updateAgendaEventMutation = useUpdateAgendaEventMutation(interval);
  const deleteAgendaEventMutation = useDeleteAgendaEventMutation(interval);
  const respondAgendaEventMutation = useRespondAgendaEventMutation(interval);
  const refreshAgendaMutation = useRefreshAgendaMutation();

  const availableCalendars = useMemo(
    () => getIncludedAgendaCalendars(googleAccountsQuery.data ?? []),
    [googleAccountsQuery.data],
  );
  const visibleEvents = useMemo(
    () => sortAgendaEvents(agendaEventsQuery.data?.events ?? []),
    [agendaEventsQuery.data?.events],
  );
  const degradedSources = agendaEventsQuery.data?.degradedSources ?? [];
  const requestError = useMemo(
    () => agendaEventsQuery.error ?? googleAccountsQuery.error ?? createAgendaEventMutation.error ?? updateAgendaEventMutation.error ?? respondAgendaEventMutation.error ?? deleteAgendaEventMutation.error ?? refreshAgendaMutation.error,
    [agendaEventsQuery.error, createAgendaEventMutation.error, deleteAgendaEventMutation.error, googleAccountsQuery.error, refreshAgendaMutation.error, respondAgendaEventMutation.error, updateAgendaEventMutation.error],
  );
  const requestErrorMessage = requestError
    ? getApiErrorMessage(requestError, 'Nao foi possivel sincronizar a agenda operacional com o backend.')
    : null;
  const hasLinkedGoogleAccount = (googleAccountsQuery.data?.length ?? 0) > 0;
  const hasIncludedCalendars = availableCalendars.length > 0;
  const isSyncingAgenda = isAuthenticated && agendaEventsQuery.isPending;
  const isRefetchingAgenda = isAuthenticated && (agendaEventsQuery.isRefetching || refreshAgendaMutation.isPending) && !agendaEventsQuery.isPending;
  const isSubmittingEvent = createAgendaEventMutation.isPending || updateAgendaEventMutation.isPending;
  const isMutatingAgenda = isSubmittingEvent || respondAgendaEventMutation.isPending || deleteAgendaEventMutation.isPending;

  async function handleSubmitEvent(values: AgendaEventFormValues, eventId?: string) {
    const payload = toAgendaEventWritePayload(values);

    if (eventId) {
      await updateAgendaEventMutation.mutateAsync({ eventId, values: payload });
    } else {
      await createAgendaEventMutation.mutateAsync(payload);
    }

    setEditingEvent(null);
    setIsEventPanelOpen(false);
  }

  async function handleRefreshAgenda() {
    await refreshAgendaMutation.mutateAsync(interval);
  }

  async function handleConfirmDeleteEvent() {
    if (!pendingDeleteEvent) {
      return;
    }

    await deleteAgendaEventMutation.mutateAsync(pendingDeleteEvent.id);
    setPendingDeleteEvent(null);
  }

  async function handleConfirmResponseAction() {
    if (!pendingResponseAction) {
      return;
    }

    await respondAgendaEventMutation.mutateAsync({
      eventId: pendingResponseAction.event.id,
      responseStatus: pendingResponseAction.nextStatus,
    });
    setPendingResponseAction(null);
  }

  function handleOpenNewEvent() {
    setEditingEvent(null);
    setIsEventPanelOpen(true);
  }

  function handleOpenEditEvent(event: AgendaEvent) {
    setEditingEvent(event);
    setIsEventPanelOpen(true);
  }

  function handleCloseEventPanel() {
    setEditingEvent(null);
    setIsEventPanelOpen(false);
  }

  return (
    <div className={agendaWorkspaceStyles.layout}>
      <div className={agendaWorkspaceStyles.stack}>
        <SectionIntro
          eyebrow="Agenda"
          title="Leitura cronologica da agenda operacional com refresh manual e CRUD real"
          description="A agenda operacional puxa o snapshot do backend, reconcilia quando voce pedir refresh e permite ajustar eventos direto do WorkCycle sem depender de outra tela."
        />

        {isAuthLoading && (
          <StateNotice
            description="A agenda real sera carregada assim que a sessao autenticada for hidratada no cliente."
            eyebrow="Autenticacao"
            title="Validando sessao antes de abrir a agenda"
            tone="info"
          />
        )}

        {hasHydratedSession && !isAuthenticated && (
          <StateNotice
            description="Entre para consultar calendarios reais, sincronizar eventos e operar o CRUD da agenda."
            eyebrow="Autenticacao"
            title="Entre para acessar a agenda operacional"
            tone="warning"
          />
        )}

        {isSyncingAgenda && (
          <StateNotice
            description="O snapshot local da agenda esta sendo carregado para este intervalo operacional."
            eyebrow="Sincronizacao"
            title="Carregando agenda persistida"
            tone="info"
          />
        )}

        {isRefetchingAgenda && (
          <StateNotice
            description="A agenda esta sendo reconciliada com o backend para evitar divergencia de cache e refletir fontes degradadas."
            eyebrow="Sincronizacao"
            title="Atualizando agenda operacional"
            tone="info"
          />
        )}

        {requestErrorMessage && (
          <StateNotice
            description={requestErrorMessage}
            eyebrow="Integracao"
            title="Falha ao sincronizar a agenda"
            tone="warning"
          />
        )}

        {degradedSources.length > 0 && (
          <StateNotice
            description={`Algumas fontes falharam nesta leitura: ${degradedSources.map((source) => source.calendarId ?? source.accountId).join(', ')}.`}
            eyebrow="Modo degradado"
            title="Parte da agenda segue disponivel, mas houve falhas parciais de sincronizacao"
            tone="warning"
          />
        )}

        <section className={agendaWorkspaceStyles.toolbar}>
          <div className={agendaWorkspaceStyles.toolbarGroup}>
            <Button onClick={() => setSelectedDate(shiftAgendaDate(selectedDate, -1))} type="button" variant="outline">Dia anterior</Button>
            <Button onClick={() => setSelectedDate(getLocalISODate(new Date()))} type="button" variant="outline">Hoje</Button>
            <Button onClick={() => setSelectedDate(shiftAgendaDate(selectedDate, 1))} type="button" variant="outline">Proximo dia</Button>
            <p className={agendaWorkspaceStyles.dayLabel}>{formatAgendaDayLabel(selectedDate)}</p>
          </div>

          <div className={agendaWorkspaceStyles.toolbarGroup}>
            <Button disabled={!isAuthenticated || isMutatingAgenda} onClick={() => void handleRefreshAgenda()} type="button" variant="outline">
              <RefreshCcw aria-hidden="true" className="mr-2 h-4 w-4" />
              {refreshAgendaMutation.isPending ? 'Atualizando...' : 'Atualizar agenda'}
            </Button>
            <Button disabled={!isAuthenticated || !hasIncludedCalendars || isMutatingAgenda} onClick={handleOpenNewEvent} type="button">
              <Plus aria-hidden="true" className="mr-2 h-4 w-4" />
              Novo evento
            </Button>
          </div>
        </section>

        {!isAuthLoading && isAuthenticated && !hasLinkedGoogleAccount && !requestErrorMessage && (
          <EmptyState
            description="Conecte uma conta Google para habilitar leitura operacional, refresh manual e criacao de eventos nesta rota."
            eyebrow="Agenda"
            hint="A rota ja existe, mas depende de contas Google vinculadas para trazer calendarios operacionais reais."
            title="Nenhuma conta Google conectada"
          />
        )}

        {!isAuthLoading && isAuthenticated && hasLinkedGoogleAccount && !hasIncludedCalendars && !requestErrorMessage && (
          <EmptyState
            description="Existem contas Google vinculadas, mas nenhum calendario esta incluido na agenda operacional neste momento."
            eyebrow="Agenda"
            hint="Ative ao menos um calendario nas configuracoes de integracao para liberar leitura e criacao nesta rota."
            title="Nenhum calendario operacional disponivel"
          />
        )}

        {isAuthenticated && hasIncludedCalendars && !isSyncingAgenda && !requestErrorMessage && visibleEvents.length === 0 && (
          <EmptyState
            description="Este intervalo ainda nao tem eventos visiveis no snapshot local. Voce pode atualizar a agenda ou criar o primeiro evento direto aqui."
            eyebrow="Agenda"
            hint="A leitura cronologica ja considera apenas os calendarios operacionais incluidos."
            title="Nenhum evento neste intervalo"
          />
        )}

        {visibleEvents.length > 0 && (
          <div className={agendaWorkspaceStyles.eventList}>
            {visibleEvents.map((event) => {
              const guestSummary = getAgendaGuestSummary(event);
              const responseActions = getAgendaResponseActions(event);

              return (
                <article className={agendaWorkspaceStyles.eventCard} key={event.id}>
                <div className={agendaWorkspaceStyles.eventHeader}>
                  <div className={agendaWorkspaceStyles.eventTitleBlock}>
                    <h2 className={agendaWorkspaceStyles.eventTitle}>{event.title}</h2>
                    <div className={agendaWorkspaceStyles.eventMeta}>
                      <span className={agendaWorkspaceStyles.eventDot} style={{ backgroundColor: event.calendarColorHex }} />
                      <span>{formatAgendaTimeRange(event)}</span>
                      <span>{event.calendarName}</span>
                      <span>{event.accountDisplayName}</span>
                      <span
                        className={cn(
                          agendaWorkspaceStyles.eventStatusBadge,
                          event.responseStatus === 'declined' && agendaWorkspaceStyles.eventStatusBadgeDeclined,
                        )}
                      >
                        {getAgendaResponseStatusLabel(event.responseStatus)}
                      </span>
                    </div>
                  </div>
                  <p className={agendaWorkspaceStyles.helper}>Ultimo sync: {formatAgendaDateTime(event.syncedAt)}</p>
                </div>

                <div className={agendaWorkspaceStyles.eventBody}>
                  {event.location ? <p><strong>Local:</strong> {event.location}</p> : null}
                  {event.meetLink ? (
                    <p>
                      <strong>Meet:</strong>{' '}
                      <a className={agendaWorkspaceStyles.eventLink} href={event.meetLink} rel="noreferrer" target="_blank">
                        Abrir link da reuniao
                      </a>
                    </p>
                  ) : null}
                  {event.description ? <p>{event.description}</p> : null}
                  {guestSummary.visibleGuests.length > 0 ? (
                    <div className={agendaWorkspaceStyles.eventGuests}>
                      <p><strong>Convidados:</strong></p>
                      <ul className={agendaWorkspaceStyles.eventGuestList}>
                        {guestSummary.visibleGuests.map((guest) => (
                          <li className={agendaWorkspaceStyles.eventGuestItem} key={guest}>{guest}</li>
                        ))}
                      </ul>
                      {guestSummary.hiddenCount > 0 ? <p className={agendaWorkspaceStyles.eventGuestOverflow}>+{guestSummary.hiddenCount} convidado(s) adicional(is)</p> : null}
                    </div>
                  ) : null}
                  {!event.description && !event.location && !event.meetLink ? <p>Evento sem descricao adicional. A leitura cronologica usa o contrato real do backend.</p> : null}
                </div>

                <div className={agendaWorkspaceStyles.eventActions}>
                  {responseActions.map((action) => (
                    <Button
                      key={`${event.id}-${action.nextStatus}`}
                      onClick={() => setPendingResponseAction({ ...action, event })}
                      size="sm"
                      type="button"
                      variant="outline"
                    >
                      {action.title}
                    </Button>
                  ))}
                  <Button onClick={() => handleOpenEditEvent(event)} size="sm" type="button" variant="outline">Editar evento</Button>
                  <Button onClick={() => setPendingDeleteEvent(event)} size="sm" type="button" variant="outline">Excluir evento</Button>
                </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <div className={agendaWorkspaceStyles.summaryColumn}>
        <div className={agendaWorkspaceStyles.summaryGrid}>
          <Card>
            <CardHeader>
              <CardDescription>Eventos visiveis</CardDescription>
              <CardTitle className={agendaWorkspaceStyles.metricValue}>{visibleEvents.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Calendarios no intervalo</CardDescription>
              <CardTitle className={agendaWorkspaceStyles.metricValue}>{countUniqueAgendaCalendars(visibleEvents)}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Eventos dia inteiro</CardDescription>
              <CardTitle className={agendaWorkspaceStyles.metricValue}>{visibleEvents.filter((event) => event.isAllDay).length}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardDescription>Calendarios operacionais</CardDescription>
            <CardTitle>Fontes disponiveis para criar</CardTitle>
          </CardHeader>
          <CardContent className={agendaWorkspaceStyles.compactList}>
            {availableCalendars.length > 0 ? availableCalendars.map((calendar) => (
              <div className={agendaWorkspaceStyles.compactItem} key={calendar.calendarId}>
                <div>
                  <p className={agendaWorkspaceStyles.compactLabel}>{calendar.calendarName}</p>
                  <p className={agendaWorkspaceStyles.compactValue}>{calendar.accountDisplayName}</p>
                </div>
                <span className={agendaWorkspaceStyles.eventDot} style={{ backgroundColor: calendar.colorHex }} />
              </div>
            )) : <p className={agendaWorkspaceStyles.helper}>Nenhum calendario operacional esta disponivel para criacao neste momento.</p>}
          </CardContent>
        </Card>
      </div>

      <OverlayPanel
        description="Cadastre ou ajuste eventos diretamente na agenda operacional. No primeiro corte, a edicao preserva o calendario original."
        isOpen={isEventPanelOpen}
        onClose={handleCloseEventPanel}
        title={editingEvent ? `Editar ${editingEvent.title}` : 'Novo evento operacional'}
      >
        <AgendaEventForm
          calendars={availableCalendars}
          defaultValues={editingEvent}
          isDisabled={!isAuthenticated || !hasIncludedCalendars || isRefetchingAgenda}
          isSubmitting={isSubmittingEvent}
          onCancelEdit={handleCloseEventPanel}
          onSubmitEvent={handleSubmitEvent}
        />
      </OverlayPanel>

      <ConfirmDialog
        confirmLabel={respondAgendaEventMutation.isPending ? 'Atualizando resposta...' : pendingResponseAction?.confirmLabel ?? 'Atualizar resposta'}
        description={pendingResponseAction?.description ?? 'Atualize a sua resposta neste convite sem excluir o evento.'}
        isOpen={Boolean(pendingResponseAction)}
        onCancel={() => setPendingResponseAction(null)}
        onConfirm={() => void handleConfirmResponseAction()}
        title={pendingResponseAction?.title ?? 'Atualizar resposta do convite'}
      >
        {pendingResponseAction?.event.title}
      </ConfirmDialog>

      <ConfirmDialog
        confirmLabel={deleteAgendaEventMutation.isPending ? 'Excluindo...' : 'Excluir'}
        description="A exclusao remove o evento do Google Calendar e do snapshot local desta agenda operacional."
        isOpen={Boolean(pendingDeleteEvent)}
        onCancel={() => setPendingDeleteEvent(null)}
        onConfirm={() => void handleConfirmDeleteEvent()}
        title="Excluir evento"
      >
        {pendingDeleteEvent?.title}
      </ConfirmDialog>
    </div>
  );
}