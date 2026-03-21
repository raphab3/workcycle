import { todayCycleSchema } from './schema';

describe('todayCycleSchema', () => {
  it('accepts a valid cycle payload', () => {
    const result = todayCycleSchema.safeParse({
      availableHours: 8,
      projectsInCycle: 3,
    });

    expect(result.success).toBe(true);
  });

  it('rejects invalid cycle limits', () => {
    const result = todayCycleSchema.safeParse({
      availableHours: 0,
      projectsInCycle: 0,
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.message)).toEqual(
      expect.arrayContaining(['Informe ao menos 1h disponivel', 'Selecione ao menos 1 projeto']),
    );
  });
});