import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().trim().min(1).max(255),
  colorHex: z.string().trim().min(1).max(32),
  allocationPct: z.number().int().min(0).max(100),
  type: z.enum(['fixed', 'rotative']),
  sprintDays: z.number().int().min(1),
  status: z.enum(['active', 'paused']).optional().default('active'),
  fixedDays: z.array(z.string()).default([]),
  fixedHoursPerDay: z.number().int().min(0).default(0),
});

export const updateProjectSchema = createProjectSchema.partial();

export const toggleProjectStatusSchema = z.object({
  status: z.enum(['active', 'paused']),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ToggleProjectStatusInput = z.infer<typeof toggleProjectStatusSchema>;
