import { render, screen } from '@testing-library/react';

import DashboardRoutePage from './page';

describe('DashboardRoutePage', () => {
  it('renders the analytical dashboard route', () => {
    render(<DashboardRoutePage />);

    expect(screen.getByRole('heading', { name: /Leitura analitica do ciclo atual/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Sugestao de redistribuicao baseada na carga aberta/i })).toBeInTheDocument();
  });
});