import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { resetWorkspaceStore, useWorkspaceStore } from '@/shared/store/useWorkspaceStore';

import { TodayPlannerOverview } from './index';

describe('TodayPlannerOverview', () => {
  beforeEach(() => {
    resetWorkspaceStore();
  });

  it('renders the operational cockpit idle state and blocks session start until a project is selected', async () => {
    const user = userEvent.setup();

    render(<TodayPlannerOverview />);

    expect(screen.getByRole('heading', { name: /Nenhuma sessao iniciada hoje/i })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /Contexto do ciclo a partir do que esta acontecendo hoje/i })).not.toBeInTheDocument();

    const startButton = screen.getByRole('button', { name: /Iniciar sessao/i });
    expect(startButton).toBeDisabled();

    await user.click(screen.getByRole('button', { name: /Selecionar projeto inicial/i }));
    await user.click(screen.getByRole('button', { name: /ClienteCore/i }));

    expect(startButton).toBeEnabled();
  });

  it('starts a session and collapses the day plan after the initial project is selected', async () => {
    const user = userEvent.setup();

    render(<TodayPlannerOverview />);

    await user.click(screen.getByRole('button', { name: /Selecionar projeto inicial/i }));
    await user.click(screen.getByRole('button', { name: /DataVault/i }));
    await user.click(screen.getByRole('button', { name: /Iniciar sessao/i }));

    expect(screen.getByRole('heading', { name: /Sessao em andamento/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Rever plano/i })).toBeInTheDocument();
    expect(screen.getByText(/Projeto ativo: DataVault/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Pausar$/i })).toBeInTheDocument();
  });

  it('switches the active project from the project picker', async () => {
    const user = userEvent.setup();

    render(<TodayPlannerOverview />);

    await user.click(screen.getByRole('button', { name: /Selecionar projeto inicial/i }));
    await user.click(screen.getByRole('button', { name: /ClienteCore/i }));
    await user.click(screen.getByRole('button', { name: /Iniciar sessao/i }));
    await user.click(screen.getByRole('button', { name: /Trocar projeto/i }));
    await user.click(screen.getByRole('button', { name: /FinTrack/i }));

    expect(screen.getByText(/Projeto ativo agora/i)).toBeInTheDocument();
    expect(screen.getByText(/^FinTrack$/i)).toBeInTheDocument();
  });

  it('renders the project-filtered Today board and moves a task to done', async () => {
    const user = userEvent.setup();

    render(<TodayPlannerOverview />);

    await user.click(screen.getByRole('button', { name: /Selecionar projeto inicial/i }));
    await user.click(screen.getByRole('button', { name: /DataVault/i }));
    await user.click(screen.getByRole('button', { name: /Iniciar sessao/i }));

    expect(screen.getByRole('heading', { name: /Board operacional de hoje/i })).toBeInTheDocument();
    expect(screen.getByText(/Ajustar migration de faturamento/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Abrir acoes de Ajustar migration de faturamento/i }));
    await user.click(screen.getByRole('button', { name: /^Done$/i }));

    const movedTask = useWorkspaceStore.getState().tasks.find((task) => task.id === 'billing-migration');

    expect(movedTask?.status).toBe('done');
    expect(movedTask?.columnId).toBe('done');
  });

  it('schedules a task to the next cycle from the Today board', async () => {
    const user = userEvent.setup();

    render(<TodayPlannerOverview />);

    await user.click(screen.getByRole('button', { name: /Selecionar projeto inicial/i }));
    await user.click(screen.getByRole('button', { name: /DataVault/i }));
    await user.click(screen.getByRole('button', { name: /Iniciar sessao/i }));

    await user.click(screen.getByRole('button', { name: /Abrir acoes de Ajustar migration de faturamento/i }));
    await user.click(screen.getByRole('button', { name: /Pular para proximo cycle/i }));
    await user.click(screen.getByRole('button', { name: /Manter estagio atual no proximo cycle/i }));

    expect(screen.getByText(/Nenhuma task do projeto DataVault entrou no cycle atual/i)).toBeInTheDocument();

    const movedTask = useWorkspaceStore.getState().tasks.find((task) => task.id === 'billing-migration');

    expect(movedTask?.cycleAssignment).toBe('next');
    expect(movedTask?.nextCycleStartDate).toBeTruthy();
  });

  it('autosaves task changes in the page drawer without closing it', async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    render(<TodayPlannerOverview />);

    await user.click(screen.getByRole('button', { name: /Selecionar projeto inicial/i }));
    await user.click(screen.getByRole('button', { name: /DataVault/i }));
    await user.click(screen.getByRole('button', { name: /Iniciar sessao/i }));
    await user.click(screen.getByRole('button', { name: /Abrir acoes de Ajustar migration de faturamento/i }));
    await user.click(screen.getByRole('button', { name: /Abrir tarefa/i }));

    expect(screen.getByRole('dialog', { name: /Ajustar migration de faturamento/i })).toBeInTheDocument();

    await user.clear(screen.getByLabelText('Titulo da tarefa'));
    await user.type(screen.getByLabelText('Titulo da tarefa'), 'Ajustar migration faturamento v2');
    await vi.advanceTimersByTimeAsync(750);

    expect(screen.getByRole('dialog', { name: /Ajustar migration faturamento v2/i })).toBeInTheDocument();
    expect(useWorkspaceStore.getState().tasks.find((task) => task.id === 'billing-migration')?.title).toBe('Ajustar migration faturamento v2');

    vi.useRealTimers();
  });

  it('shows the rollover prompt for active users near midnight', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 2, 22, 23, 56, 0));
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    resetWorkspaceStore();
    render(<TodayPlannerOverview />);

    await user.click(screen.getByRole('button', { name: /Selecionar projeto inicial/i }));
    await user.click(screen.getByRole('button', { name: /ClienteCore/i }));
    await user.click(screen.getByRole('button', { name: /Iniciar sessao/i }));
    await vi.advanceTimersByTimeAsync(1_200);

    expect(screen.getByRole('dialog', { name: /Virada do dia em andamento/i })).toBeInTheDocument();
    expect(screen.getByText(/Horas registradas hoje/i)).toBeInTheDocument();

    vi.useRealTimers();
  });

  it('opens the close-day drawer from the running state', async () => {
    const user = userEvent.setup();

    render(<TodayPlannerOverview />);

    await user.click(screen.getByRole('button', { name: /Selecionar projeto inicial/i }));
    await user.click(screen.getByRole('button', { name: /ClienteCore/i }));
    await user.click(screen.getByRole('button', { name: /Iniciar sessao/i }));
    await user.click(screen.getAllByRole('button', { name: /Encerrar dia/i })[0]);

    expect(screen.getByRole('dialog', { name: /Encerrar dia/i })).toBeInTheDocument();
    expect(screen.getByText(/Linha do tempo de pulsos/i)).toBeInTheDocument();
    expect(screen.getByText(/Fechamento com horas finais/i)).toBeInTheDocument();
  });

  it('shows paused inactivity actions and opens the review drawer', async () => {
    const user = userEvent.setup();

    render(<TodayPlannerOverview />);

    await user.click(screen.getByRole('button', { name: /Selecionar projeto inicial/i }));
    await user.click(screen.getByRole('button', { name: /ClienteCore/i }));
    await user.click(screen.getByRole('button', { name: /Iniciar sessao/i }));

    act(() => {
      useWorkspaceStore.getState().firePulse('2026-03-22T09:30:00.000Z');
      useWorkspaceStore.getState().expireActivePulse('2026-03-22T09:35:00.000Z');
    });

    expect(screen.getByRole('heading', { name: /Sessao pausada por inatividade/i })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Revisar tempo/i }));

    expect(screen.getByRole('dialog', { name: /Revisar tempo/i })).toBeInTheDocument();
    expect(screen.getByText(/Confirme ou marque como inativo/i)).toBeInTheDocument();
  });
});