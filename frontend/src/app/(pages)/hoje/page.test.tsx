import { render, screen } from '@testing-library/react';

import HojeRoutePage from './page';

describe('HojeRoutePage', () => {
  it('renders the operational context for the today route', () => {
    render(<HojeRoutePage />);

    expect(screen.getByRole('heading', { name: /Contexto do ciclo a partir do que esta acontecendo hoje/i })).toBeInTheDocument();
    expect(screen.getByText(/Backlog ocupa 5% da janela de 4 semanas/i)).toBeInTheDocument();
    expect(screen.getByText(/Distribuicao inicial do dia/i)).toBeInTheDocument();
  });
});