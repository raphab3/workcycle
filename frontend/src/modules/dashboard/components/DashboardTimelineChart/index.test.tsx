import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { DashboardTimelinePoint } from '../../types';
import { DashboardTimelineChart } from './index';

const points: DashboardTimelinePoint[] = [
  {
    date: '2026-03-20T00:00:00.000Z',
    shortLabel: '20/03',
    totalHours: 4.2,
    projects: [
      { projectId: 'cliente-core', projectName: 'ClienteCore', colorHex: '#0F172A', hours: 1.7 },
      { projectId: 'fintrack', projectName: 'FinTrack', colorHex: '#1D4ED8', hours: 2.5 },
    ],
  },
  {
    date: '2026-03-21T00:00:00.000Z',
    shortLabel: '21/03',
    totalHours: 5.1,
    projects: [
      { projectId: 'cliente-core', projectName: 'ClienteCore', colorHex: '#0F172A', hours: 2.3 },
      { projectId: 'fintrack', projectName: 'FinTrack', colorHex: '#1D4ED8', hours: 2.8 },
    ],
  },
];

describe('DashboardTimelineChart', () => {
  it('renders chart details for the active day', () => {
    render(<DashboardTimelineChart points={points} />);
    const details = screen.getByLabelText('Detalhes do dia selecionado');

    expect(screen.getByLabelText('Grafico temporal de 30 dias')).toBeInTheDocument();
    expect(screen.getByText(/Leitura do dia/i)).toBeInTheDocument();
    expect(within(details).getAllByText('ClienteCore').length).toBeGreaterThan(0);
    expect(within(details).getAllByText('FinTrack').length).toBeGreaterThan(0);
  });

  it('allows highlighting a project from the legend', async () => {
    const user = userEvent.setup();

    render(<DashboardTimelineChart points={points} />);
    const fintrackButton = screen.getByRole('button', { name: 'FinTrack' });

    await user.click(fintrackButton);

    expect(fintrackButton).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /Limpar foco/i })).toBeInTheDocument();
  });
});