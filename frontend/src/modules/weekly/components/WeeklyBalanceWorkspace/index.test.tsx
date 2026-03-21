import { render, screen } from '@testing-library/react';

import { WeeklyBalanceWorkspace } from './index';

describe('WeeklyBalanceWorkspace', () => {
  it('renders weekly summary and deviation board', () => {
    render(<WeeklyBalanceWorkspace />);

    expect(screen.getByText('Previsto na semana')).toBeInTheDocument();
    expect(screen.getByText('Projeto')).toBeInTheDocument();
    expect(screen.getByText('Previsto')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('renders project rows and status labels', () => {
    render(<WeeklyBalanceWorkspace />);

    expect(screen.getAllByText('ClienteCore').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Equilibrado').length).toBeGreaterThan(0);
  });
});