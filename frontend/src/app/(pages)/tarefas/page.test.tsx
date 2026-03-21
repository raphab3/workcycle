import { render, screen } from '@testing-library/react';

import TarefasRoutePage from './page';

describe('TarefasRoutePage', () => {
  it('renders the tasks board heading and an example task', () => {
    render(<TarefasRoutePage />);

    expect(screen.getByRole('heading', { name: /Visao de carga por projeto, prioridade e prazo/i })).toBeInTheDocument();
    expect(screen.getByText(/Ajustar migration de faturamento/i)).toBeInTheDocument();
  });
});