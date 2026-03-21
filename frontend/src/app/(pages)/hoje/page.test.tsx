import { render, screen } from '@testing-library/react';

import HojeRoutePage from './page';

describe('HojeRoutePage', () => {
  it('renders the kickoff copy for the today route', () => {
    render(<HojeRoutePage />);

    expect(screen.getByRole('heading', { name: /Planejamento do ciclo com horas disponiveis, redistribuicao e ajuste real/i })).toBeInTheDocument();
    expect(screen.getByText(/Distribuicao inicial do dia/i)).toBeInTheDocument();
  });
});