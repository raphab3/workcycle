import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { resetWorkspaceStore } from '@/shared/store/useWorkspaceStore';
import { AppLayout } from './index';
import { ThemeProvider } from '@/shared/theme';

const usePathnameMock = vi.fn();

vi.mock('next/navigation', () => ({
  usePathname: () => usePathnameMock(),
}));

describe('AppLayout', () => {
  beforeEach(() => {
    resetWorkspaceStore();
  });

  it('renders sidebar, header and nested content', () => {
    usePathnameMock.mockReturnValue('/hoje');

    render(
      <ThemeProvider>
        <AppLayout>
          <div>Conteudo do ciclo</div>
        </AppLayout>
      </ThemeProvider>,
    );

    expect(screen.getByText('WorkCycle')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Hoje' }).length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: 'Pular para o conteudo' })).toBeInTheDocument();
    expect(screen.getByLabelText('Buscar projeto')).toBeInTheDocument();
    expect(screen.getByText('Conteudo do ciclo')).toBeInTheDocument();
  });

  it('toggles the theme mode and collapses the sidebar', async () => {
    const user = userEvent.setup();

    usePathnameMock.mockReturnValue('/hoje');

    render(
      <ThemeProvider>
        <AppLayout>
          <div>Conteudo do ciclo</div>
        </AppLayout>
      </ThemeProvider>,
    );

    expect(document.documentElement).toHaveAttribute('data-theme', 'light');

    await user.click(screen.getByRole('button', { name: 'Usar tema escuro' }));
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');

    await user.click(screen.getByRole('button', { name: 'Recolher barra lateral' }));
    expect(screen.getByRole('button', { name: 'Expandir barra lateral' })).toBeInTheDocument();
  });

  it('renders the brand and nested content', () => {
    usePathnameMock.mockReturnValue('/hoje');

    render(
      <ThemeProvider>
        <AppLayout>
          <div>Conteudo do ciclo</div>
        </AppLayout>
      </ThemeProvider>,
    );

    expect(screen.getByText('WorkCycle')).toBeInTheDocument();
    expect(screen.getByText('Conteudo do ciclo')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Pular para o conteudo' })).toBeInTheDocument();
  });
});