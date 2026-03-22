import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import ProjetosRoutePage from './page';

function renderProjetosRoutePage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ProjetosRoutePage />
    </QueryClientProvider>,
  );
}

describe('ProjetosRoutePage', () => {
  it('renders the projects portfolio heading and a project card', () => {
    renderProjetosRoutePage();

    expect(screen.getByRole('heading', { name: /Cadastro funcional da carteira com regras de alocacao, sprint e contrato/i })).toBeInTheDocument();
    expect(screen.getByText('ClienteCore')).toBeInTheDocument();
  });
});