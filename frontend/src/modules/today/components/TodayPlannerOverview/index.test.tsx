import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { TodayPlannerOverview } from './index';

describe('TodayPlannerOverview', () => {
  it('renders fixed and rotative planning blocks', () => {
    render(<TodayPlannerOverview />);

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
});