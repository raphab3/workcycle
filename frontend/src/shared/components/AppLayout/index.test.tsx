import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';

import { resetAuthStore, useAuthStore } from '@/modules/auth/store/useAuthStore';
import { resetWorkspaceStore } from '@/shared/store/useWorkspaceStore';
import { AppLayout } from './index';
import { ThemeProvider } from '@/shared/theme';

const usePathnameMock = vi.fn();
const replaceMock = vi.fn();

function renderAppLayout() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AppLayout>
          <div>Conteudo do ciclo</div>
        </AppLayout>
      </ThemeProvider>
    </QueryClientProvider>,
  );
}

vi.mock('next/navigation', () => ({
  usePathname: () => usePathnameMock(),
  useRouter: () => ({
    replace: replaceMock,
  }),
}));

describe('AppLayout', () => {
  beforeEach(() => {
    resetAuthStore();
    resetWorkspaceStore();
    replaceMock.mockReset();
  });

  it('renders sidebar, header and nested content', () => {
    usePathnameMock.mockReturnValue('/hoje');

    renderAppLayout();

    expect(screen.getByText('WorkCycle')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Hoje' }).length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: 'Pular para o conteudo' })).toBeInTheDocument();
    expect(screen.getByLabelText('Buscar projeto')).toBeInTheDocument();
    expect(screen.getByText('Conteudo do ciclo')).toBeInTheDocument();
  });

  it('toggles the theme mode and collapses the sidebar', async () => {
    const user = userEvent.setup();

    usePathnameMock.mockReturnValue('/hoje');

    renderAppLayout();

    expect(document.documentElement).toHaveAttribute('data-theme', 'light');

    await user.click(screen.getByRole('button', { name: 'Usar tema escuro' }));
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');

    await user.click(screen.getByRole('button', { name: 'Recolher barra lateral' }));
    expect(screen.getByRole('button', { name: 'Expandir barra lateral' })).toBeInTheDocument();
  });

  it('renders the brand and nested content', () => {
    usePathnameMock.mockReturnValue('/hoje');

    renderAppLayout();

    expect(screen.getByText('WorkCycle')).toBeInTheDocument();
    expect(screen.getByText('Conteudo do ciclo')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Pular para o conteudo' })).toBeInTheDocument();
  });

  it('signs out and redirects to login', async () => {
    const user = userEvent.setup();

    usePathnameMock.mockReturnValue('/hoje');
    useAuthStore.getState().signIn({
      token: 'auth-token',
      user: {
        authProvider: 'email',
        displayName: 'Rafa',
        email: 'rafa@example.com',
        hasGoogleLinked: false,
        hasPassword: true,
        id: 'user-1',
      },
    });

    renderAppLayout();

    await user.click(screen.getByRole('button', { name: 'Sair' }));

    expect(useAuthStore.getState().session).toBeNull();
    expect(useAuthStore.getState().sessionStatus).toBe('unauthenticated');
    expect(replaceMock).toHaveBeenCalledWith('/login?logout=1');
  });
});