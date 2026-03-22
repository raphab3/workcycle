import { z } from 'zod';

const weekDaySchema = z.enum(['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom']);

const projectFieldSchemas = {
  allocationPct: z.number().int().min(0).max(100).describe('Weekly allocation percentage for the project.'),
  colorHex: z.string().trim().regex(/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/).describe('Project color swatch rendered in the frontend.'),
  fixedDays: z.array(weekDaySchema).describe('Fixed week days used when the project type is fixed.'),
  fixedHoursPerDay: z.number().int().min(0).describe('Hours reserved per fixed day when the project type is fixed.'),
  name: z.string().trim().min(1).max(255).describe('Visible project name used by the Projects workspace.'),
  sprintDays: z.union([z.literal(7), z.literal(14), z.literal(30)]).describe('Sprint window supported by the frontend domain model.'),
  status: z.enum(['active', 'paused']).describe('Persisted project status.'),
  type: z.enum(['fixed', 'rotative']).describe('Scheduling mode used by the project.'),
} as const;

const baseProjectSchema = z.object({
  allocationPct: projectFieldSchemas.allocationPct,
  colorHex: projectFieldSchemas.colorHex,
  fixedDays: projectFieldSchemas.fixedDays.default([]),
  fixedHoursPerDay: projectFieldSchemas.fixedHoursPerDay.default(0),
  name: projectFieldSchemas.name,
  sprintDays: projectFieldSchemas.sprintDays,
  status: projectFieldSchemas.status.optional().default('active'),
  type: projectFieldSchemas.type,
});

export const createProjectSchema = baseProjectSchema;

export const updateProjectSchema = z.object({
  allocationPct: projectFieldSchemas.allocationPct.optional(),
  colorHex: projectFieldSchemas.colorHex.optional(),
  fixedDays: projectFieldSchemas.fixedDays.optional(),
  fixedHoursPerDay: projectFieldSchemas.fixedHoursPerDay.optional(),
  name: projectFieldSchemas.name.optional(),
  sprintDays: projectFieldSchemas.sprintDays.optional(),
  status: projectFieldSchemas.status.optional(),
  type: projectFieldSchemas.type.optional(),
})
  .refine((input) => Object.values(input).some((value) => value !== undefined), {
    message: 'At least one project field must be provided for update.',
  });

export const toggleProjectStatusSchema = z.object({
  status: z.enum(['active', 'paused']),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ToggleProjectStatusInput = z.infer<typeof toggleProjectStatusSchema>;
