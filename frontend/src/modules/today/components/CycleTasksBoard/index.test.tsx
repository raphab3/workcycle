import { fireEvent, render, screen } from '@testing-library/react';
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
        onMoveTaskOnBoard={vi.fn()}
        onSkipTask={vi.fn()}
        onUpdateTask={vi.fn()}
        projects={mockProjects}
        taskColumns={defaultTaskColumns}
        tasks={mockTasks}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Backlog' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'In Progress' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Done' })).toBeInTheDocument();
    expect(screen.getByText('Ajustar migration de faturamento')).toBeInTheDocument();
    expect(screen.getByText(/Fechar a migration principal do faturamento/i)).toBeInTheDocument();
    expect(screen.getByText('1/3')).toBeInTheDocument();
    expect(screen.queryByText('Fechar refinamento da sprint')).not.toBeInTheDocument();
  });

  it('opens the action menu, opens the task drawer, and sends the selected skip strategy', async () => {
    const user = userEvent.setup();
    const onSkipTask = vi.fn();

    render(
      <CycleTasksBoard
        activeProject={mockProjects[2]!}
        onMoveTaskOnBoard={vi.fn()}
        onSkipTask={onSkipTask}
        onUpdateTask={vi.fn()}
        projects={mockProjects}
        taskColumns={defaultTaskColumns}
        tasks={mockTasks}
      />,
    );

    await user.click(screen.getByRole('button', { name: /Abrir acoes de Ajustar migration de faturamento/i }));
    await user.click(screen.getByRole('button', { name: /Abrir tarefa/i }));

    expect(screen.getByRole('dialog', { name: /Ajustar migration de faturamento/i })).toBeInTheDocument();
    expect(screen.getByDisplayValue(/Fechar a migration principal do faturamento/i)).toBeInTheDocument();

    await user.click(screen.getAllByRole('button', { name: /Fechar painel/i })[1]!);
    await user.click(screen.getByRole('button', { name: /Abrir acoes de Ajustar migration de faturamento/i }));
    await user.click(screen.getByRole('button', { name: /Pular para proximo cycle/i }));
    expect(screen.getByText(/Escolha como essa task deve entrar no proximo dia/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Resetar para Backlog no proximo dia/i }));

    expect(onSkipTask).toHaveBeenCalledWith('billing-migration', 'reset-to-backlog');
  });

  it('moves and reorders tasks with drag and drop', () => {
    const onMoveTaskOnBoard = vi.fn();

    render(
      <CycleTasksBoard
        activeProject={mockProjects[1]!}
        onMoveTaskOnBoard={onMoveTaskOnBoard}
        onSkipTask={vi.fn()}
        onUpdateTask={vi.fn()}
        projects={mockProjects}
        taskColumns={defaultTaskColumns}
        tasks={mockTasks}
      />,
    );

    const draggedTask = screen.getByText('Fechar refinamento da sprint').closest('article');
    const doneColumn = screen.getByLabelText('Lista Done');

    if (!draggedTask) {
      throw new Error('Dragged task card not found');
    }

    fireEvent.dragStart(draggedTask);
    fireEvent.dragOver(doneColumn);
    fireEvent.drop(doneColumn);

    expect(onMoveTaskOnBoard).toHaveBeenCalledWith('sprint-refinement', 'done', undefined);
  });
});