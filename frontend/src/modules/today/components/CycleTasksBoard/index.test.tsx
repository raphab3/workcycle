import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { mockProjects } from '@/modules/projects/mocks/projects';
import { defaultTaskColumns } from '@/modules/tasks/mocks/taskColumns';
import { mockTasks } from '@/modules/tasks/mocks/tasks';

import { CycleTasksBoard } from './index';

describe('CycleTasksBoard', () => {
  it('renders the fixed columns and project-filtered tasks', () => {
    render(
      <CycleTasksBoard
        activeProject={mockProjects[2]!}
        onMoveTaskToColumn={vi.fn()}
        onSkipTask={vi.fn()}
        taskColumns={defaultTaskColumns}
        tasks={mockTasks}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Backlog' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'In Progress' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Done' })).toBeInTheDocument();
    expect(screen.getByText('Ajustar migration de faturamento')).toBeInTheDocument();
    expect(screen.queryByText('Fechar refinamento da sprint')).not.toBeInTheDocument();
  });

  it('opens quick confirm and sends the selected skip strategy', async () => {
    const user = userEvent.setup();
    const onSkipTask = vi.fn();

    render(
      <CycleTasksBoard
        activeProject={mockProjects[2]!}
        onMoveTaskToColumn={vi.fn()}
        onSkipTask={onSkipTask}
        taskColumns={defaultTaskColumns}
        tasks={mockTasks}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Pular para proximo cycle' }));
    expect(screen.getByText(/Escolha como essa task deve entrar no proximo dia/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Resetar para Backlog no proximo dia/i }));

    expect(onSkipTask).toHaveBeenCalledWith('billing-migration', 'reset-to-backlog');
  });
});