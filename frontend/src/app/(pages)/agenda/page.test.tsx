import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';

import AgendaRoutePage from './page';

vi.mock('@/modules/agenda/components/AgendaWorkspace/index', () => ({
  AgendaWorkspace: () => <div>Agenda workspace mounted</div>,
}));

function renderAgendaRoutePage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AgendaRoutePage />
    </QueryClientProvider>,
  );
}

describe('AgendaRoutePage', () => {
  it('renders the agenda workspace composition', () => {
    renderAgendaRoutePage();

    expect(screen.getByText('Agenda workspace mounted')).toBeInTheDocument();
  });
});