import { render, screen } from '@testing-library/react';

import TarefasRoutePage from './page';

describe('TarefasRoutePage', () => {
  it('renders the tasks board heading and an example task', () => {
    render(<TarefasRoutePage />);

    expect(screen.getByRole('heading', { name: /Gestao editorial de tarefas com prioridade, prazo e associacao por projeto/i })).toBeInTheDocument();
    expect(screen.getByText(/Ajustar migration de faturamento/i)).toBeInTheDocument();
  });
});