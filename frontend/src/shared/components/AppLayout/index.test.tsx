import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { AppLayout } from './index';

vi.mock('@/shared/components/AppNavigation/index', () => ({
  AppNavigation: () => <nav>Navegacao</nav>,
}));

describe('AppLayout', () => {
  it('renders the brand and nested content', () => {
    render(
      <AppLayout>
        <div>Conteudo do ciclo</div>
      </AppLayout>,
    );

    expect(screen.getByText('WorkCycle')).toBeInTheDocument();
    expect(screen.getByText('Navegacao')).toBeInTheDocument();
    expect(screen.getByText('Conteudo do ciclo')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Pular para o conteudo' })).toBeInTheDocument();
  });
});