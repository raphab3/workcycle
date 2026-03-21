import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { mockProjects } from '@/modules/projects/mocks/projects';

import { ProjectsList } from './index';

describe('ProjectsList', () => {
  it('renders fixed and paused variations', () => {
    render(
      <ProjectsList projects={mockProjects} onEditProject={vi.fn()} onToggleStatus={vi.fn()} />,
    );

    expect(screen.getByText('ClienteCore')).toBeInTheDocument();
    expect(screen.getByText('Fixo')).toBeInTheDocument();
    expect(screen.getByText('Pausado')).toBeInTheDocument();
  });
});