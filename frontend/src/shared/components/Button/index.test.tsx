import { render, screen } from '@testing-library/react';

import { Button } from './index';

describe('Button', () => {
  it('renders button text', () => {
    render(<Button>Salvar</Button>);

    expect(screen.getByRole('button', { name: 'Salvar' })).toBeInTheDocument();
  });

  it('applies the outline variant classes', () => {
    render(<Button variant="outline">Voltar</Button>);

    expect(screen.getByRole('button', { name: 'Voltar' })).toHaveClass('border');
  });
});