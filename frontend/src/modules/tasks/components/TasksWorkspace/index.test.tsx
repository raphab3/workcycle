import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAuthStore } from '@/modules/auth/store/useAuthStore';
import { mockProjects } from '@/modules/projects/mocks/projects';
import { projectsService } from '@/modules/projects/services/projectsService';
import { mockTasks } from '@/modules/tasks/mocks/tasks';
import { tasksService } from '@/modules/tasks/services/tasksService';
import { resetWorkspaceStore } from '@/shared/store/useWorkspaceStore';

import { TasksWorkspace } from './index';

function renderTasksWorkspace() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <TasksWorkspace />
    </QueryClientProvider>,
  );
}

describe('TasksWorkspace', () => {
  beforeEach(() => {
    resetWorkspaceStore();
    useAuthStore.setState({
      hasHydrated: true,
      session: null,
      sessionStatus: 'authenticated',
    });
    vi.restoreAllMocks();
    vi.spyOn(projectsService, 'getProjects').mockResolvedValue(mockProjects);
    vi.spyOn(tasksService, 'getTasks').mockResolvedValue(mockTasks);
  });

  it('renders the persisted board with fixed backend columns', async () => {
    renderTasksWorkspace();

    expect(await screen.findByText('Painel de tasks')).toBeInTheDocument();
    expect(await screen.findByText('Ajustar migration de faturamento')).toBeInTheDocument();
    expect(screen.getByText('Tasks em aberto')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Backlog' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'In Progress' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'CodeReview' })).toBeInTheDocument();
    expect(screen.getByText(/Fechar a migration principal do faturamento/i)).toBeInTheDocument();
    expect(screen.getByText('Carga aberta da carteira atual')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Nova task/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Adicionar coluna' })).not.toBeInTheDocument();
  });

  it('filters tasks by selected project and creates a persisted task', async () => {
    const user = userEvent.setup();
    const createTaskSpy = vi.spyOn(tasksService, 'createTask').mockResolvedValue({
      ...mockTasks[0],
      checklist: [{ done: false, id: 'new-check', label: 'Conferir dependencias' }],
      cycleAssignment: 'backlog',
      cycleSessionId: null,
      id: 'task-2',
      projectId: 'cliente-core',
      title: 'Planejar entrega mobile',
    });

    renderTasksWorkspace();

    await screen.findByText('Ajustar migration de faturamento');

    await user.selectOptions(screen.getAllByLabelText('Projeto')[0], 'fintrack');

    expect(screen.getByText('Fechar refinamento da sprint')).toBeInTheDocument();
    expect(screen.queryByText('Ajustar migration de faturamento')).not.toBeInTheDocument();

    await user.selectOptions(screen.getAllByLabelText('Projeto')[0], 'all');

    await user.click(screen.getByRole('button', { name: /Nova task/i }));
    await user.type(screen.getByLabelText('Titulo da tarefa'), 'Planejar entrega mobile');
    await user.type(screen.getByLabelText('Descricao'), 'Detalhar milestones, handoff e riscos do fluxo mobile antes da reuniao com o time.');
    await user.selectOptions(screen.getAllByLabelText('Projeto')[1], 'cliente-core');
    expect(screen.getAllByRole('option', { name: 'Cycle atual' }).some((option) => (option as HTMLOptionElement).disabled)).toBe(true);
    await user.type(screen.getByLabelText('Novo item do checklist'), 'Conferir dependencias');
    await user.click(screen.getByRole('button', { name: /Adicionar item/i }));
    await user.click(screen.getByRole('button', { name: 'Adicionar tarefa' }));

    await waitFor(() => {
      expect(createTaskSpy.mock.calls[0]?.[0]).toEqual(expect.objectContaining({
        checklist: [expect.objectContaining({ label: 'Conferir dependencias' })],
        cycleAssignment: 'backlog',
        cycleSessionId: null,
        projectId: 'cliente-core',
        title: 'Planejar entrega mobile',
      }));
    });
  });

  it('reallocates and archives a task through backend mutations', async () => {
    const user = userEvent.setup();
    const updateTaskStatusSpy = vi.spyOn(tasksService, 'updateTaskStatus').mockResolvedValue({
      ...mockTasks[0],
      cycleAssignment: 'next',
      cycleSessionId: null,
    });
    const archiveTaskSpy = vi.spyOn(tasksService, 'archiveTask').mockResolvedValue({
      ...mockTasks[0],
      isArchived: true,
    });

    renderTasksWorkspace();

    await screen.findByText('Ajustar migration de faturamento');

    const taskCard = screen.getByText('Ajustar migration de faturamento').closest('article');

    expect(taskCard).not.toBeNull();

    await user.click(within(taskCard as HTMLElement).getByRole('button', { name: 'Abrir opcoes de Ajustar migration de faturamento' }));
    await user.selectOptions(screen.getByLabelText('Cycle Ajustar migration de faturamento'), 'next');

    await waitFor(() => {
      expect(updateTaskStatusSpy.mock.calls[0]?.[0]).toEqual({
        taskId: 'billing-migration',
        cycleAssignment: 'next',
        cycleSessionId: null,
      });
    });

    await user.click(screen.getByRole('button', { name: 'Abrir opcoes de Ajustar migration de faturamento' }));
    await user.click(screen.getByRole('button', { name: 'Arquivar' }));
    const dialog = screen.getByRole('alertdialog', { name: 'Arquivar task' });
    await user.click(within(dialog).getByRole('button', { name: 'Arquivar' }));

    await waitFor(() => {
      expect(archiveTaskSpy.mock.calls[0]?.[0]).toEqual({ taskId: 'billing-migration' });
    });
  });
});