import { taskFormSchema } from './schema';

describe('taskFormSchema', () => {
  it('accepts a valid task payload', () => {
    const result = taskFormSchema.safeParse({
      title: 'Preparar roteirizacao do dashboard',
      projectId: 'fintrack',
      priority: 'high',
      status: 'todo',
      dueInDays: 2,
      estimatedHours: 3,
    });

    expect(result.success).toBe(true);
  });

  it('requires project and title', () => {
    const result = taskFormSchema.safeParse({
      title: 'abc',
      projectId: '',
      priority: 'medium',
      status: 'todo',
      dueInDays: 2,
      estimatedHours: 1,
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.message)).toEqual(
      expect.arrayContaining(['Informe pelo menos 4 caracteres', 'Selecione um projeto']),
    );
  });
});