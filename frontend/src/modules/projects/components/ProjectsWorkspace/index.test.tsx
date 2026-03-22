import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { resetAuthStore, useAuthStore } from '@/modules/auth/store/useAuthStore';

import type { Project } from '@/modules/projects/types';

import { ProjectsWorkspace } from './index';

const projectsData: Project[] = [
  {
    allocationPct: 40,
    colorHex: '#506169',
    fixedDays: [],
    fixedHoursPerDay: 0,
    id: 'project-1',
    name: 'ClienteCore',
    sprintDays: 14,
    status: 'active',
    type: 'rotative',
  },
];

const useProjectsQueryMock = vi.fn();
const useCreateProjectMutationMock = vi.fn();
const useUpdateProjectMutationMock = vi.fn();
const useToggleProjectStatusMutationMock = vi.fn();

vi.mock('@/modules/projects/queries/useProjectsQuery', () => ({
  useProjectsQuery: (...args: unknown[]) => useProjectsQueryMock(...args),
}));

vi.mock('@/modules/projects/queries/useCreateProjectMutation', () => ({
  useCreateProjectMutation: () => useCreateProjectMutationMock(),
}));

vi.mock('@/modules/projects/queries/useUpdateProjectMutation', () => ({
  useUpdateProjectMutation: () => useUpdateProjectMutationMock(),
}));

vi.mock('@/modules/projects/queries/useToggleProjectStatusMutation', () => ({
  useToggleProjectStatusMutation: () => useToggleProjectStatusMutationMock(),
}));

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
    resetAuthStore();
    useAuthStore.getState().signIn({
      accessToken: 'auth-token',
      accessTokenExpiresAt: '2026-03-22T12:00:00.000Z',
      refreshToken: 'refresh-token',
      refreshTokenExpiresAt: '2026-03-29T12:00:00.000Z',
      refreshTokenPolicy: {
        endpoint: '/api/auth/refresh',
        rotation: 'rotate',
        transport: 'body',
      },
      tokenType: 'Bearer',
      user: {
        authProvider: 'email',
        displayName: 'Rafa',
        email: 'rafa@example.com',
        hasGoogleLinked: false,
        hasPassword: true,
        id: 'user-1',
      },
    });
    useProjectsQueryMock.mockReturnValue({
      data: projectsData,
      error: null,
      isPending: false,
      isRefetching: false,
    });
    useCreateProjectMutationMock.mockReturnValue({
      error: null,
      isPending: false,
      mutateAsync: vi.fn(),
    });
    useUpdateProjectMutationMock.mockReturnValue({
      error: null,
      isPending: false,
      mutateAsync: vi.fn(),
    });
    useToggleProjectStatusMutationMock.mockReturnValue({
      error: null,
      isPending: false,
      mutateAsync: vi.fn(),
    });
  });

  it('renders the allocation summary and existing projects', () => {
    renderProjectsWorkspace();

    expect(screen.getByText('Percentual alocado')).toBeInTheDocument();
    expect(screen.getByText('ClienteCore')).toBeInTheDocument();
    expect(screen.getByText(/Ainda faltam percentuais para distribuir/i)).toBeInTheDocument();
  });

  it('creates a new rotative project through the backend mutation flow', async () => {
    const user = userEvent.setup();
    const mutateAsync = vi.fn().mockResolvedValue({
      ...projectsData[0],
      id: 'project-2',
      name: 'ReportPilot',
    });
    useCreateProjectMutationMock.mockReturnValue({
      error: null,
      isPending: false,
      mutateAsync,
    });
    useProjectsQueryMock.mockReturnValue({
      data: [],
      error: null,
      isPending: false,
      isRefetching: false,
    });

    renderProjectsWorkspace();

    await user.type(screen.getByLabelText('Nome do projeto'), 'ReportPilot');
    await user.clear(screen.getByLabelText('Alocacao semanal (%)'));
    await user.type(screen.getByLabelText('Alocacao semanal (%)'), '4');
    await user.click(screen.getByRole('button', { name: 'Adicionar projeto' }));

    expect(mutateAsync).toHaveBeenCalledWith(expect.objectContaining({
      allocationPct: 4,
      name: 'ReportPilot',
    }));
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

  it('shows an explicit loading state while the backend list is pending', () => {
    useProjectsQueryMock.mockReturnValue({
      data: undefined,
      error: null,
      isPending: true,
      isRefetching: false,
    });

    renderProjectsWorkspace();

    expect(screen.getByText('Carregando carteira persistida')).toBeInTheDocument();
  });

  it('shows a refetch notice while reconciling cached projects', () => {
    useProjectsQueryMock.mockReturnValue({
      data: projectsData,
      error: null,
      isPending: false,
      isRefetching: true,
    });

    renderProjectsWorkspace();

    expect(screen.getByText('Atualizando carteira persistida')).toBeInTheDocument();
  });

  it('shows the backend error state without falling back to mock local data', () => {
    useProjectsQueryMock.mockReturnValue({
      data: undefined,
      error: new Error('backend offline'),
      isPending: false,
      isRefetching: false,
    });

    renderProjectsWorkspace();

    expect(screen.getByText('Falha ao sincronizar projetos')).toBeInTheDocument();
    expect(screen.queryByText('ClienteCore')).not.toBeInTheDocument();
  });
});