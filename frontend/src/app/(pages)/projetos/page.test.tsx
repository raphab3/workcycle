import { render, screen } from '@testing-library/react';

import ProjetosRoutePage from './page';

describe('ProjetosRoutePage', () => {
  it('renders the projects portfolio heading and a project card', () => {
    render(<ProjetosRoutePage />);

    expect(screen.getByRole('heading', { name: /Portifolio com alocacao, tipo de contrato e horizonte de sprint/i })).toBeInTheDocument();
    expect(screen.getByText('ClienteCore')).toBeInTheDocument();
  });
});