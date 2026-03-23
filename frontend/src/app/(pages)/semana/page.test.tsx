import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';

import SemanaRoutePage from './page';

vi.mock('@/modules/weekly/components/WeeklyBalanceWorkspace/index', () => ({
  WeeklyBalanceWorkspace: () => <div>Weekly workspace mounted</div>,
}));

function renderSemanaRoutePage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <SemanaRoutePage />
    </QueryClientProvider>,
  );
}

describe('SemanaRoutePage', () => {
  it('renders the weekly workspace composition', () => {
    renderSemanaRoutePage();

    expect(screen.getByText('Weekly workspace mounted')).toBeInTheDocument();
  });
});