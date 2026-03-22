import { taskFormSchema } from './schema';

describe('taskFormSchema', () => {
  it('accepts a valid task payload', () => {
    const result = taskFormSchema.safeParse({
      title: 'Preparar roteirizacao do dashboard',
      description: 'Consolidar contexto, riscos e entregas para alinhar a execucao do dashboard sem perder o fluxo do cycle.',
      projectId: 'fintrack',
      columnId: 'backlog',
      checklist: [],
      priority: 'high',
      status: 'todo',
      cycleAssignment: 'backlog',
      dueInDays: 2,
      estimatedHours: 3,
    });

    expect(result.success).toBe(true);
  });

  it('requires project and title', () => {
    const result = taskFormSchema.safeParse({
      title: 'abc',
      description: 'Descricao suficientemente longa para nao cair na validacao de texto minimo.',
      projectId: '',
      columnId: 'backlog',
      checklist: [],
      priority: 'medium',
      status: 'todo',
      cycleAssignment: 'backlog',
      dueInDays: 2,
      estimatedHours: 1,
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.message)).toEqual(
      expect.arrayContaining(['Informe pelo menos 4 caracteres', 'Selecione um projeto']),
    );
  });
});