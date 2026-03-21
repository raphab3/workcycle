import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { CycleTasksBoard } from './index';

describe('CycleTasksBoard', () => {
  it('renders tasks that fit and overflow the cycle', () => {
    render(
      <CycleTasksBoard
        availableHours={4}
        nextCycleTasksCount={2}
        onCompleteTask={vi.fn()}
        onSkipTask={vi.fn()}
        taskPlan={{
          plannedHours: 5.5,
          remainingHours: 0,
          overflowHours: 1.5,
          tasks: [
            {
              taskId: 'one',
              title: 'Fechar refinamento da sprint',
              projectId: 'fintrack',
              projectName: 'FinTrack',
              colorHex: '#1D4ED8',
              priority: 'high',
              status: 'doing',
              estimatedHours: 2,
              dueLabel: 'vence em 2 dias',
              fitsInCycle: true,
              cumulativeHours: 2,
            },
            {
              taskId: 'two',
              title: 'Ajustar migration de faturamento',
              projectId: 'datavault',
              projectName: 'DataVault',
              colorHex: '#0F766E',
              priority: 'critical',
              status: 'todo',
              estimatedHours: 3.5,
              dueLabel: 'vence hoje',
              fitsInCycle: false,
              cumulativeHours: 5.5,
            },
          ],
        }}
      />,
    );

    expect(screen.getByText('Fechar refinamento da sprint')).toBeInTheDocument();
    expect(screen.getByText(/Cabe no cycle ate 2h00/i)).toBeInTheDocument();
    expect(screen.getByText(/Excede o cycle em 1h30/i)).toBeInTheDocument();
  });

  it('triggers complete and skip actions', async () => {
    const user = userEvent.setup();
    const onCompleteTask = vi.fn();
    const onSkipTask = vi.fn();

    render(
      <CycleTasksBoard
        availableHours={4}
        nextCycleTasksCount={0}
        onCompleteTask={onCompleteTask}
        onSkipTask={onSkipTask}
        taskPlan={{
          plannedHours: 2,
          remainingHours: 2,
          overflowHours: 0,
          tasks: [
            {
              taskId: 'one',
              title: 'Fechar refinamento da sprint',
              projectId: 'fintrack',
              projectName: 'FinTrack',
              colorHex: '#1D4ED8',
              priority: 'high',
              status: 'doing',
              estimatedHours: 2,
              dueLabel: 'vence em 2 dias',
              fitsInCycle: true,
              cumulativeHours: 2,
            },
          ],
        }}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Concluir task' }));
    await user.click(screen.getByRole('button', { name: 'Pular para proximo cycle' }));

    expect(onCompleteTask).toHaveBeenCalledWith('one');
    expect(onSkipTask).toHaveBeenCalledWith('one');
  });
});