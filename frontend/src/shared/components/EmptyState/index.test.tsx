import { render, screen } from '@testing-library/react';

import { EmptyState } from './index';

describe('EmptyState', () => {
  it('renders the empty state copy', () => {
    render(
      <EmptyState
        eyebrow="Semana"
        title="Sem ciclos registrados"
        description="Assim que o usuario fechar um ciclo, o resumo entra aqui."
        hint="Use esta area para orientar o proximo passo."
      />,
    );

    expect(screen.getByText('Semana')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Sem ciclos registrados' })).toBeInTheDocument();
    expect(screen.getByText('Use esta area para orientar o proximo passo.')).toBeInTheDocument();
  });
});