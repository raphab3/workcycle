import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { resetWorkspaceStore } from '@/shared/store/useWorkspaceStore';

import { DashboardWorkspace } from './index';

describe('DashboardWorkspace', () => {
  beforeEach(() => {
    resetWorkspaceStore();
  });

  it('renders the analytical sections for the dashboard route', () => {
    render(<DashboardWorkspace />);

    expect(screen.getByRole('heading', { name: /Leitura analitica do ciclo atual/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Abrir Hoje operacional/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Sugestao de redistribuicao baseada na carga aberta/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Planned vs actual por projeto na semana atual/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Resumo da carga aberta da carteira atual/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /O que pede decisao antes de mexer no plano/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Acumulado por projeto na semana atual e janela mensal simulada/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Ultimos 30 dias de horas trabalhadas por projeto/i })).toBeInTheDocument();
    expect(screen.getByLabelText('Grafico temporal de 30 dias')).toBeInTheDocument();
  });

  it('collapses the redistribution banner details', async () => {
    const user = userEvent.setup();

    render(<DashboardWorkspace />);

    expect(screen.getByLabelText('Detalhes de redistribuicao')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Ocultar detalhes/i }));

    expect(screen.queryByLabelText('Detalhes de redistribuicao')).not.toBeInTheDocument();
  });
});