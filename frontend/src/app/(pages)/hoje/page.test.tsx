import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';

import HojeRoutePage from './page';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('HojeRoutePage', () => {
  it('renders the operational cockpit for the today route', () => {
    render(<HojeRoutePage />, { wrapper: createWrapper() });

    expect(screen.getByRole('heading', { name: /Nenhuma sessao iniciada hoje/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Horas disponiveis e distribuicao recomendada/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Iniciar sessao/i })).toBeDisabled();
  });
});