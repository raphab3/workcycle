import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { resetWorkspaceStore } from '@/shared/store/useWorkspaceStore';

import { ProjectsWorkspace } from './index';

function renderProjectsWorkspace() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ProjectsWorkspace />
    </QueryClientProvider>,
  );
}

describe('ProjectsWorkspace', () => {
  beforeEach(() => {
    resetWorkspaceStore();
  });

  it('renders the allocation summary and existing projects', () => {
    renderProjectsWorkspace();

    expect(screen.getByText('Percentual alocado')).toBeInTheDocument();
    expect(screen.getByText('ClienteCore')).toBeInTheDocument();
    expect(screen.getByText(/Ainda faltam percentuais para distribuir/i)).toBeInTheDocument();
  });

  it('creates a new rotative project from the form', async () => {
    const user = userEvent.setup();

    renderProjectsWorkspace();

    await user.type(screen.getByLabelText('Nome do projeto'), 'ReportPilot');
    await user.clear(screen.getByLabelText('Alocacao semanal (%)'));
    await user.type(screen.getByLabelText('Alocacao semanal (%)'), '4');
    await user.click(screen.getByRole('button', { name: 'Adicionar projeto' }));

    expect(await screen.findByText('ReportPilot')).toBeInTheDocument();
  });

  it('shows validation for a fixed project without days and hours', async () => {
    const user = userEvent.setup();

    renderProjectsWorkspace();

    await user.type(screen.getByLabelText('Nome do projeto'), 'Projeto Fixo');
    await user.click(screen.getByLabelText('Fixo'));
    await user.click(screen.getByRole('button', { name: 'Adicionar projeto' }));

    expect(await screen.findByText('Selecione ao menos um dia fixo')).toBeInTheDocument();
    expect(await screen.findByText('Informe horas reservadas para projeto fixo')).toBeInTheDocument();
  });
});