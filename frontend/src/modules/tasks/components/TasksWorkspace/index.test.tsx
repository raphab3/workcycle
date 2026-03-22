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

    expect(screen.getByText('Painel de tasks')).toBeInTheDocument();
    expect(screen.getByText('Tasks em aberto')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Backlog' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'In Progress' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'CodeReview' })).toBeInTheDocument();
    expect(screen.getByText('Ajustar migration de faturamento')).toBeInTheDocument();
    expect(screen.getByText(/Fechar a migration principal do faturamento/i)).toBeInTheDocument();
    expect(screen.getByText('Carga aberta da carteira atual')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Nova task/i })).toBeInTheDocument();
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

    await user.click(screen.getByRole('button', { name: /Nova task/i }));
    await user.type(screen.getByLabelText('Titulo da tarefa'), 'Planejar entrega mobile');
    await user.type(screen.getByLabelText('Descricao'), 'Detalhar milestones, handoff e riscos do fluxo mobile antes da reuniao com o time.');
    await user.selectOptions(screen.getAllByLabelText('Projeto')[1], 'cliente-core');
    await user.type(screen.getByLabelText('Novo item do checklist'), 'Conferir dependencias');
    await user.click(screen.getByRole('button', { name: /Adicionar item/i }));
    await user.click(screen.getByRole('button', { name: 'Adicionar tarefa' }));

    expect(await screen.findByText('Planejar entrega mobile')).toBeInTheDocument();
    expect(screen.getByText(/Detalhar milestones, handoff e riscos/i)).toBeInTheDocument();
  });

  it('reallocates a task to the next cycle', async () => {
    const user = userEvent.setup();

    render(<TasksWorkspace />);

    const taskCard = screen.getByText('Ajustar migration de faturamento').closest('article');

    expect(taskCard).not.toBeNull();

    await user.click(within(taskCard as HTMLElement).getByRole('button', { name: 'Abrir opcoes de Ajustar migration de faturamento' }));
    await user.selectOptions(screen.getByLabelText('Cycle Ajustar migration de faturamento'), 'next');

    expect(within(taskCard as HTMLElement).getByText('Proximo cycle')).toBeInTheDocument();
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
    await user.click(screen.getByRole('button', { name: 'Abrir opcoes de Ajustar migration de faturamento' }));
    await user.selectOptions(screen.getByLabelText('Mover Ajustar migration de faturamento'), 'waiting-qa-5');

    const customColumn = screen.getByText('Waiting QA').closest('section');

    expect(customColumn).not.toBeNull();
    expect(within(customColumn as HTMLElement).getByText('Ajustar migration de faturamento')).toBeInTheDocument();
  });

  it('opens a task in the drawer and closes the menu when clicking outside', async () => {
    const user = userEvent.setup();

    render(<TasksWorkspace />);

    await user.click(screen.getByRole('button', { name: 'Abrir opcoes de Ajustar migration de faturamento' }));
    expect(screen.getByRole('button', { name: 'Abrir task' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Fechar opcoes' }));
    expect(screen.queryByRole('button', { name: 'Abrir task' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Abrir opcoes de Ajustar migration de faturamento' }));
    await user.click(screen.getByRole('button', { name: 'Abrir task' }));

    expect(screen.getByRole('heading', { name: 'Editar Ajustar migration de faturamento' })).toBeInTheDocument();
    expect(screen.getByText('Revisar indexes')).toBeInTheDocument();
  });

  it('removes a custom column and reassigns its tasks to backlog', async () => {
    const user = userEvent.setup();

    render(<TasksWorkspace />);

    await user.type(screen.getByLabelText('Nome da coluna'), 'Waiting QA');
    await user.click(screen.getByRole('button', { name: 'Criar coluna' }));
    await user.click(screen.getByRole('button', { name: 'Abrir opcoes de Ajustar migration de faturamento' }));
    await user.selectOptions(screen.getByLabelText('Mover Ajustar migration de faturamento'), 'waiting-qa-5');
    await user.click(screen.getByRole('button', { name: 'Remover coluna Waiting QA' }));

    const dialog = screen.getByRole('alertdialog', { name: 'Remover coluna' });
    await user.click(within(dialog).getByRole('button', { name: 'Remover coluna' }));

    expect(screen.queryByText('Waiting QA')).not.toBeInTheDocument();

    const backlogColumn = screen.getByRole('heading', { name: 'Backlog' }).closest('section');
    expect(backlogColumn).not.toBeNull();
    expect(within(backlogColumn as HTMLElement).getByText('Ajustar migration de faturamento')).toBeInTheDocument();
  });

  it('archives a task after confirmation', async () => {
    const user = userEvent.setup();

    render(<TasksWorkspace />);

    await user.click(screen.getByRole('button', { name: 'Abrir opcoes de Ajustar migration de faturamento' }));
    await user.click(screen.getByRole('button', { name: 'Arquivar' }));
    const dialog = screen.getByRole('alertdialog', { name: 'Arquivar task' });
    await user.click(within(dialog).getByRole('button', { name: 'Arquivar' }));

    expect(screen.queryByText('Ajustar migration de faturamento')).not.toBeInTheDocument();
  });
});