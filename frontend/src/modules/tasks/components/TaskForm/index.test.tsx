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
    expect(screen.getByDisplayValue(/Fechar a migration principal do faturamento/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue('3.5')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Cycle atual')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Backlog')).toBeInTheDocument();
    expect(screen.getByText('Revisar indexes')).toBeInTheDocument();
  });

  it('submits a valid task', async () => {
    const user = userEvent.setup();
    const onSubmitTask = vi.fn();

    render(<TaskForm columns={defaultTaskColumns} onCancelEdit={vi.fn()} onSubmitTask={onSubmitTask} projects={mockProjects} />);

    await user.type(screen.getByLabelText('Titulo da tarefa'), 'Preparar handoff do projeto');
    await user.type(screen.getByLabelText('Descricao'), 'Consolidar contexto, checklist e pontos de transicao antes do handoff para o time.');
    await user.selectOptions(screen.getByLabelText('Projeto'), 'fintrack');
    await user.type(screen.getByLabelText('Novo item do checklist'), 'Validar criterio final');
    await user.click(screen.getByRole('button', { name: /Adicionar item/i }));
    await user.click(screen.getByRole('button', { name: 'Adicionar tarefa' }));

    expect(onSubmitTask).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Preparar handoff do projeto',
        description: 'Consolidar contexto, checklist e pontos de transicao antes do handoff para o time.',
        projectId: 'fintrack',
        cycleAssignment: 'backlog',
        columnId: 'backlog',
        checklist: [expect.objectContaining({ label: 'Validar criterio final', done: false })],
      }),
      undefined,
    );
  });

  it('autosaves valid changes when enabled for editing', async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const onSubmitTask = vi.fn();

    render(
      <TaskForm
        autosave
        autosaveDelayMs={300}
        columns={defaultTaskColumns}
        defaultValues={mockTasks[0]}
        onCancelEdit={vi.fn()}
        onSubmitTask={onSubmitTask}
        projects={mockProjects}
      />, 
    );

    await user.clear(screen.getByLabelText('Titulo da tarefa'));
    await user.type(screen.getByLabelText('Titulo da tarefa'), 'Ajustar migration faturamento v2');
    await vi.advanceTimersByTimeAsync(350);

    expect(onSubmitTask).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Ajustar migration faturamento v2' }),
      'billing-migration',
    );

    vi.useRealTimers();
  });
});