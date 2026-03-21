import { render, screen } from '@testing-library/react';

import ProjetosRoutePage from './page';

describe('ProjetosRoutePage', () => {
  it('renders the projects portfolio heading and a project card', () => {
    render(<ProjetosRoutePage />);

    expect(screen.getByRole('heading', { name: /Cadastro funcional da carteira com regras de alocacao, sprint e contrato/i })).toBeInTheDocument();
    expect(screen.getByText('ClienteCore')).toBeInTheDocument();
  });
});