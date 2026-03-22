import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { AppNavigation } from './index';

const usePathnameMock = vi.fn();

vi.mock('next/navigation', () => ({
  usePathname: () => usePathnameMock(),
}));

describe('AppNavigation', () => {
  it('renders the five main routes with dashboard first', () => {
    usePathnameMock.mockReturnValue('/hoje');

    render(<AppNavigation />);

    expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Hoje' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Semana' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Tarefas' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Projetos' })).toBeInTheDocument();
    expect(screen.getAllByRole('link')[0]).toHaveTextContent('Dashboard');
  });

  it('marks the current route as active', () => {
    usePathnameMock.mockReturnValue('/tarefas');

    render(<AppNavigation />);

    expect(screen.getByRole('link', { name: 'Tarefas' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Hoje' })).not.toHaveAttribute('aria-current');
  });

  it('keeps sidebar labels accessible when collapsed', () => {
    usePathnameMock.mockReturnValue('/hoje');

    render(<AppNavigation variant="sidebar" collapsed />);

    expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Hoje' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Projetos' })).toBeInTheDocument();
  });
});