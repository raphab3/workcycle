import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { resetWorkspaceStore } from '@/shared/store/useWorkspaceStore';

import { TasksWorkspace } from './index';

describe('TasksWorkspace', () => {
  beforeEach(() => {
    resetWorkspaceStore();
  });

  it('renders the new tasks workspace and seed tasks', () => {
    render(<TasksWorkspace />);

    expect(screen.getByText('Tasks em aberto')).toBeInTheDocument();
    expect(screen.getByText('Ajustar migration de faturamento')).toBeInTheDocument();
    expect(screen.getByText('Carga aberta reaproveitando a carteira do Cycle 2')).toBeInTheDocument();
  });

  it('filters tasks by selected project', async () => {
    const user = userEvent.setup();

    render(<TasksWorkspace />);

    await user.selectOptions(screen.getAllByLabelText('Projeto')[0], 'fintrack');

    expect(screen.getByText('Fechar refinamento da sprint')).toBeInTheDocument();
    expect(screen.queryByText('Ajustar migration de faturamento')).not.toBeInTheDocument();
  });

  it('creates a new task associated with a project', async () => {
    const user = userEvent.setup();

    render(<TasksWorkspace />);

    await user.type(screen.getByLabelText('Titulo da tarefa'), 'Planejar entrega mobile');
    await user.selectOptions(screen.getAllByLabelText('Projeto')[1], 'cliente-core');
    await user.click(screen.getByRole('button', { name: 'Adicionar tarefa' }));

    expect(await screen.findByText('Planejar entrega mobile')).toBeInTheDocument();
  });
});