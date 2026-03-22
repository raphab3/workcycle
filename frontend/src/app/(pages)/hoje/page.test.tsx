import { render, screen } from '@testing-library/react';

import HojeRoutePage from './page';

describe('HojeRoutePage', () => {
  it('renders the operational cockpit for the today route', () => {
    render(<HojeRoutePage />);

    expect(screen.getByRole('heading', { name: /Nenhuma sessao iniciada hoje/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Horas disponiveis e distribuicao recomendada/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Iniciar sessao/i })).toBeDisabled();
  });
});