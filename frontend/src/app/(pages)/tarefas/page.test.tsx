import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';

import TarefasRoutePage from './page';

vi.mock('@/modules/tasks/components/TasksWorkspace/index', () => ({
  TasksWorkspace: () => <div>Tasks workspace mounted</div>,
}));

function renderTarefasRoutePage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <TarefasRoutePage />
    </QueryClientProvider>,
  );
}

describe('TarefasRoutePage', () => {
  it('renders the tasks workspace composition', () => {
    renderTarefasRoutePage();

    expect(screen.getByText('Tasks workspace mounted')).toBeInTheDocument();
  });
});