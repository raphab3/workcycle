import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { resetWorkspaceStore, useWorkspaceStore } from '@/shared/store/useWorkspaceStore';

import { TodayPlannerOverview } from './index';

describe('TodayPlannerOverview', () => {
  beforeEach(() => {
    resetWorkspaceStore();
  });

  it('renders operational context derived from the current plan', () => {
    render(<TodayPlannerOverview />);

    expect(screen.getByText('50h00 projetadas no ritmo atual')).toBeInTheDocument();
    expect(screen.getByText('Backlog ocupa 5% da janela de 4 semanas')).toBeInTheDocument();
    expect(screen.getByText('3 sinais de atencao ativos')).toBeInTheDocument();
    expect(screen.getByText(/AuthGuard esta pausado/i)).toBeInTheDocument();
  });

  it('reflects shared task changes from the workspace store', () => {
    useWorkspaceStore.getState().addTask({
      title: 'Escalar analise de onboarding',
      projectId: 'cliente-core',
      cycleAssignment: 'current',
      priority: 'critical',
      status: 'todo',
      dueInDays: 0,
      estimatedHours: 6,
    });

    render(<TodayPlannerOverview />);

    expect(screen.getByText(/Maior pressao atual em ClienteCore/i)).toBeInTheDocument();
  });

  it('renders fixed and rotative planning blocks', () => {
    render(<TodayPlannerOverview />);

    expect(screen.getByText('Tasks alocadas no cycle')).toBeInTheDocument();
    expect(screen.getByText('Ajustar migration de faturamento')).toBeInTheDocument();
    expect(screen.getByText('Distribuicao inicial do dia')).toBeInTheDocument();
    expect(screen.getAllByText('ClienteCore').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Fixo').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Rotativo').length).toBeGreaterThan(0);
  });

  it('collapses and expands the suggestion banner', async () => {
    const user = userEvent.setup();

    render(<TodayPlannerOverview />);

    expect(screen.getByLabelText('Detalhes de redistribuicao')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Ocultar detalhes' }));
    expect(screen.queryByLabelText('Detalhes de redistribuicao')).not.toBeInTheDocument();
    expect(screen.queryByText(/Sugestao de redistribuicao baseada na carga aberta/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Mostrar detalhes' }));
    expect(screen.getByLabelText('Detalhes de redistribuicao')).toBeInTheDocument();
    expect(screen.getByText(/Sugestao de redistribuicao baseada na carga aberta/i)).toBeInTheDocument();
  });

  it('adjusts actual hours with the execution stepper', async () => {
    const user = userEvent.setup();

    render(<TodayPlannerOverview />);

    expect(screen.getByText(/Horas reais registradas: 10h00/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Aumentar ClienteCore' }));
    expect(screen.getByText(/Horas reais registradas: 10h30/i)).toBeInTheDocument();
  });

  it('allows concluding or skipping tasks from the current cycle', async () => {
    const user = userEvent.setup();

    render(<TodayPlannerOverview />);

    const billingTaskCard = screen.getByText('Ajustar migration de faturamento').closest('article');
    const refinementTaskCard = screen.getByText('Fechar refinamento da sprint').closest('article');

    expect(billingTaskCard).not.toBeNull();
    expect(refinementTaskCard).not.toBeNull();

    await user.click(within(billingTaskCard as HTMLElement).getByRole('button', { name: 'Pular para proximo cycle' }));
    expect(screen.queryByText('Ajustar migration de faturamento')).not.toBeInTheDocument();

    await user.click(within(refinementTaskCard as HTMLElement).getByRole('button', { name: 'Concluir task' }));
    expect(screen.queryByText('Fechar refinamento da sprint')).not.toBeInTheDocument();
  });
});