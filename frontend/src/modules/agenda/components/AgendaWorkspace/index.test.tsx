import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { AgendaWorkspace } from './index';

const refreshMutateAsyncMock = vi.fn();
const createMutateAsyncMock = vi.fn();
const updateMutateAsyncMock = vi.fn();
const deleteMutateAsyncMock = vi.fn();

function buildAttendees(total: number) {
  return Array.from({ length: total }, (_, index) => ({
    displayName: `Convidado ${index + 1}`,
    email: `guest${index + 1}@work.dev`,
  }));
}

const useAuthStoreMock = vi.fn();
const useGoogleAccountsQueryMock = vi.fn();
const useAgendaEventsQueryMock = vi.fn();

vi.mock('@/modules/auth/store/useAuthStore', () => ({
  useAuthStore: (selector: (state: { hasHydrated: boolean; sessionStatus: string }) => unknown) => useAuthStoreMock(selector),
}));

vi.mock('@/modules/auth/queries/useGoogleAccountsQuery', () => ({
  useGoogleAccountsQuery: () => useGoogleAccountsQueryMock(),
}));

vi.mock('@/modules/agenda/queries/useAgendaEventsQuery', () => ({
  useAgendaEventsQuery: () => useAgendaEventsQueryMock(),
}));

vi.mock('@/modules/agenda/queries/useRefreshAgendaMutation', () => ({
  useRefreshAgendaMutation: () => ({
    error: null,
    isPending: false,
    mutateAsync: refreshMutateAsyncMock,
  }),
}));

vi.mock('@/modules/agenda/queries/useCreateAgendaEventMutation', () => ({
  useCreateAgendaEventMutation: () => ({
    error: null,
    isPending: false,
    mutateAsync: createMutateAsyncMock,
  }),
}));

vi.mock('@/modules/agenda/queries/useUpdateAgendaEventMutation', () => ({
  useUpdateAgendaEventMutation: () => ({
    error: null,
    isPending: false,
    mutateAsync: updateMutateAsyncMock,
  }),
}));

vi.mock('@/modules/agenda/queries/useDeleteAgendaEventMutation', () => ({
  useDeleteAgendaEventMutation: () => ({
    error: null,
    isPending: false,
    mutateAsync: deleteMutateAsyncMock,
  }),
}));

function renderAgendaWorkspace() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AgendaWorkspace />
    </QueryClientProvider>,
  );
}

describe('AgendaWorkspace', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-22T10:00:00.000Z'));
    refreshMutateAsyncMock.mockReset();
    createMutateAsyncMock.mockReset();
    updateMutateAsyncMock.mockReset();
    deleteMutateAsyncMock.mockReset();
    useAuthStoreMock.mockImplementation((selector: (state: { hasHydrated: boolean; sessionStatus: string }) => unknown) => selector({
      hasHydrated: true,
      sessionStatus: 'authenticated',
    }));
    useGoogleAccountsQueryMock.mockReturnValue({
      data: [{
        calendars: [{
          accountId: 'account-1',
          colorHex: '#3367D6',
          id: 'calendar-1',
          isIncluded: true,
          isPrimary: true,
          name: 'Primary',
          syncedAt: '2026-03-22T08:50:00.000Z',
        }],
        displayName: 'Rafa Work',
        email: 'rafa@work.dev',
        id: 'account-1',
        isActive: true,
        tokenExpiresAt: '2099-03-22T08:00:00.000Z',
        updatedAt: '2026-03-22T08:00:00.000Z',
      }],
      error: null,
    });
    useAgendaEventsQueryMock.mockReturnValue({
      data: {
        degradedSources: [],
        events: [
          {
            accountDisplayName: 'Rafa Work',
            accountEmail: 'rafa@work.dev',
            accountId: 'account-1',
            attendees: buildAttendees(3),
            calendarColorHex: '#3367D6',
            calendarId: 'calendar-1',
            calendarName: 'Primary',
            description: 'Revisar backlog do dia',
            endAt: '2026-03-22T12:00:00.000Z',
            id: 'calendar-1:event-2',
            isAllDay: false,
            location: null,
            meetLink: null,
            projectId: null,
            recurrenceRule: null,
            recurringEventId: null,
            responseStatus: 'accepted',
            startAt: '2026-03-22T11:00:00.000Z',
            syncedAt: '2026-03-22T08:50:00.000Z',
            title: 'Planejamento semanal',
            updatedAt: '2026-03-22T08:50:00.000Z',
          },
          {
            accountDisplayName: 'Rafa Work',
            accountEmail: 'rafa@work.dev',
            accountId: 'account-1',
            attendees: buildAttendees(12),
            calendarColorHex: '#3367D6',
            calendarId: 'calendar-1',
            calendarName: 'Primary',
            description: 'Daily do produto',
            endAt: '2026-03-22T10:00:00.000Z',
            id: 'calendar-1:event-1',
            isAllDay: false,
            location: 'Meet',
            meetLink: 'https://meet.google.com/example-link',
            projectId: null,
            recurrenceRule: null,
            recurringEventId: null,
            responseStatus: 'accepted',
            startAt: '2026-03-22T09:00:00.000Z',
            syncedAt: '2026-03-22T08:50:00.000Z',
            title: 'Daily operacional',
            updatedAt: '2026-03-22T08:50:00.000Z',
          },
        ],
      },
      error: null,
      isPending: false,
      isRefetching: false,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders events in chronological order and exposes manual refresh', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    renderAgendaWorkspace();

    const headings = screen.getAllByRole('heading', { level: 2 });
    expect(headings[0]).toHaveTextContent('Daily operacional');
    expect(headings[1]).toHaveTextContent('Planejamento semanal');
    expect(screen.getByRole('link', { name: 'Abrir link da reuniao' })).toHaveAttribute('href', 'https://meet.google.com/example-link');
    expect(screen.getAllByText('Convidado 1 <guest1@work.dev>')).toHaveLength(2);
    expect(screen.getByText('Convidado 10 <guest10@work.dev>')).toBeInTheDocument();
    expect(screen.queryByText('Convidado 11 <guest11@work.dev>')).not.toBeInTheDocument();
    expect(screen.getByText('+2 convidado(s) adicional(is)')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Atualizar agenda' }));

    expect(refreshMutateAsyncMock).toHaveBeenCalledTimes(1);
  });

  it('creates a new event through the workspace form', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    renderAgendaWorkspace();

    await user.click(screen.getByRole('button', { name: 'Novo evento' }));
    await user.selectOptions(screen.getByLabelText('Calendario'), 'calendar-1');
    await user.type(screen.getByLabelText('Titulo'), 'Checkpoint do dia');
    await user.type(screen.getByLabelText('Inicio'), '2026-03-22T13:00');
    await user.type(screen.getByLabelText('Termino'), '2026-03-22T14:00');
    await user.type(screen.getByLabelText('Local'), 'Sala 1');
    await user.click(screen.getByRole('button', { name: 'Criar evento' }));

    expect(createMutateAsyncMock).toHaveBeenCalledWith({
      calendarId: 'calendar-1',
      description: undefined,
      endAt: '2026-03-22T14:00:00.000Z',
      location: 'Sala 1',
      startAt: '2026-03-22T13:00:00.000Z',
      title: 'Checkpoint do dia',
    });
  });

  it('updates and deletes an existing event', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    renderAgendaWorkspace();

    await user.click(screen.getAllByRole('button', { name: 'Editar evento' })[0]);
    const titleInput = screen.getByLabelText('Titulo');
    await user.clear(titleInput);
    await user.type(titleInput, 'Daily revisada');
    await user.click(screen.getByRole('button', { name: 'Salvar alteracoes' }));

    expect(updateMutateAsyncMock).toHaveBeenCalledWith({
      eventId: 'calendar-1:event-1',
      values: {
        calendarId: 'calendar-1',
        description: 'Daily do produto',
        endAt: '2026-03-22T10:00:00.000Z',
        location: 'Meet',
        startAt: '2026-03-22T09:00:00.000Z',
        title: 'Daily revisada',
      },
    });

    await user.click(screen.getAllByRole('button', { name: 'Excluir evento' })[0]);
    await user.click(screen.getByRole('button', { name: 'Excluir' }));

    expect(deleteMutateAsyncMock).toHaveBeenCalledWith('calendar-1:event-1');
  });
});