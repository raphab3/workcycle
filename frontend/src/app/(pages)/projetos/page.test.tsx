import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';

import ProjetosRoutePage from './page';

vi.mock('@/modules/projects/components/ProjectsWorkspace/index', () => ({
  ProjectsWorkspace: () => <div>Projects workspace mounted</div>,
}));

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
  it('renders the projects workspace composition', () => {
    renderProjetosRoutePage();

    expect(screen.getByText('Projects workspace mounted')).toBeInTheDocument();
  });
});