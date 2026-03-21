import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { mockProjects } from '@/modules/projects/mocks/projects';
import { defaultTaskColumns } from '@/modules/tasks/mocks/taskColumns';
import { mockTasks } from '@/modules/tasks/mocks/tasks';

import { TaskForm } from './index';

describe('TaskForm', () => {
  it('loads task defaults when editing', () => {
    render(
      <TaskForm columns={defaultTaskColumns} defaultValues={mockTasks[0]} onCancelEdit={vi.fn()} onSubmitTask={vi.fn()} projects={mockProjects} />,
    );

    expect(screen.getByDisplayValue('Ajustar migration de faturamento')).toBeInTheDocument();
    expect(screen.getByDisplayValue('3.5')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Cycle atual')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Backlog')).toBeInTheDocument();
  });

  it('submits a valid task', async () => {
    const user = userEvent.setup();
    const onSubmitTask = vi.fn();

    render(<TaskForm columns={defaultTaskColumns} onCancelEdit={vi.fn()} onSubmitTask={onSubmitTask} projects={mockProjects} />);

    await user.type(screen.getByLabelText('Titulo da tarefa'), 'Preparar handoff do projeto');
    await user.selectOptions(screen.getByLabelText('Projeto'), 'fintrack');
    await user.click(screen.getByRole('button', { name: 'Adicionar tarefa' }));

    expect(onSubmitTask).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Preparar handoff do projeto', projectId: 'fintrack', cycleAssignment: 'backlog', columnId: 'backlog' }),
      undefined,
    );
  });
});