import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { mockProjects } from '@/modules/projects/mocks/projects';

import { ProjectForm } from './index';

describe('ProjectForm', () => {
  it('loads fixed project defaults when editing', () => {
    render(
      <ProjectForm defaultValues={mockProjects[0]} onCancelEdit={vi.fn()} onSubmitProject={vi.fn()} />,
    );

    expect(screen.getByDisplayValue('ClienteCore')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2')).toBeInTheDocument();
  });

  it('submits a valid rotative project', async () => {
    const user = userEvent.setup();
    const onSubmitProject = vi.fn();

    render(<ProjectForm onCancelEdit={vi.fn()} onSubmitProject={onSubmitProject} />);

    await user.type(screen.getByLabelText('Nome do projeto'), 'MediSync');
    await user.clear(screen.getByLabelText('Alocacao semanal (%)'));
    await user.type(screen.getByLabelText('Alocacao semanal (%)'), '15');
    await user.click(screen.getByRole('button', { name: 'Adicionar projeto' }));

    expect(onSubmitProject).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'MediSync', allocationPct: 15, type: 'rotative' }),
      undefined,
    );
  });
});