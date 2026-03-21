import { render, screen, within } from '@testing-library/react';
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
    expect(screen.getByText('Backlog')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('CodeReview')).toBeInTheDocument();
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

  it('reallocates a task to the next cycle', async () => {
    const user = userEvent.setup();

    render(<TasksWorkspace />);

    await user.click(screen.getAllByRole('button', { name: 'Proximo cycle' })[0]);
    await user.selectOptions(screen.getAllByLabelText('Cycle')[0], 'next');

    expect(screen.getByText('Ajustar migration de faturamento')).toBeInTheDocument();
  });

  it('creates a new dynamic kanban column', async () => {
    const user = userEvent.setup();

    render(<TasksWorkspace />);

    await user.type(screen.getByLabelText('Nome da coluna'), 'Waiting QA');
    await user.selectOptions(screen.getByLabelText('Categoria da coluna'), 'blocked');
    await user.click(screen.getByRole('button', { name: 'Criar coluna' }));

    expect(screen.getByText('Waiting QA')).toBeInTheDocument();
  });

  it('moves a task to a custom column', async () => {
    const user = userEvent.setup();

    render(<TasksWorkspace />);

    await user.type(screen.getByLabelText('Nome da coluna'), 'Waiting QA');
    await user.click(screen.getByRole('button', { name: 'Criar coluna' }));
    await user.selectOptions(screen.getByLabelText('Mover Ajustar migration de faturamento'), 'waiting-qa-5');

    const customColumn = screen.getByText('Waiting QA').closest('section');

    expect(customColumn).not.toBeNull();
    expect(within(customColumn as HTMLElement).getByText('Ajustar migration de faturamento')).toBeInTheDocument();
  });
});