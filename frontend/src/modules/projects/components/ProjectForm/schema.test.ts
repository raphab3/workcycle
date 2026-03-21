import { projectFormSchema } from './schema';

describe('projectFormSchema', () => {
  it('accepts a valid rotative project', () => {
    const result = projectFormSchema.safeParse({
      name: 'FinTrack',
      colorHex: '#1D4ED8',
      allocationPct: 20,
      type: 'rotative',
      sprintDays: 14,
      status: 'active',
      fixedDays: [],
      fixedHoursPerDay: 0,
    });

    expect(result.success).toBe(true);
  });

  it('requires fixed days and reserved hours for fixed projects', () => {
    const result = projectFormSchema.safeParse({
      name: 'ClienteCore',
      colorHex: '#0F172A',
      allocationPct: 25,
      type: 'fixed',
      sprintDays: 14,
      status: 'active',
      fixedDays: [],
      fixedHoursPerDay: 0,
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.message)).toEqual(
      expect.arrayContaining(['Selecione ao menos um dia fixo', 'Informe horas reservadas para projeto fixo']),
    );
  });
});