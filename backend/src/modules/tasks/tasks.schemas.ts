import { z } from 'zod';

import { TASK_BOARD_COLUMN_IDS, TASK_CYCLE_ASSIGNMENT_VALUES, TASK_PRIORITY_VALUES, TASK_STATUS_VALUES, getTaskStatusForColumn } from '@/modules/tasks/types/task';

import type { TaskBoardColumnId, TaskCycleAssignment, TaskStatus } from '@/modules/tasks/types/task';

type PartialTaskBoardInput = {
  columnId?: TaskBoardColumnId | undefined;
  cycleAssignment?: TaskCycleAssignment | undefined;
  cycleSessionId?: string | null | undefined;
  status?: TaskStatus | undefined;
};

const isoDateSchema = z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/,
  'Use o formato YYYY-MM-DD para datas persistidas.');

const checklistItemInputSchema = z.object({
  done: z.boolean(),
  id: z.string().trim().optional(),
  label: z.string().trim().min(2).max(80),
});

function validateBoardConsistency(input: PartialTaskBoardInput, context: z.RefinementCtx) {
  if (input.columnId && input.status) {
    const expectedStatus = getTaskStatusForColumn(input.columnId);

    if (input.status !== expectedStatus) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Task status must match the selected board column (${expectedStatus}).`,
        path: ['status'],
      });
    }
  }

  if (input.cycleAssignment === 'current' && !input.cycleSessionId) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Tasks in the current cycle must reference a concrete cycle session.',
      path: ['cycleSessionId'],
    });
  }

  if (input.cycleAssignment && input.cycleAssignment !== 'current' && input.cycleSessionId) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Only current-cycle tasks may reference a concrete cycle session.',
      path: ['cycleSessionId'],
    });
  }
}

function validateNonEmptyUpdate(input: Record<string, unknown>, context: z.RefinementCtx, message: string) {
  if (Object.values(input).every((value) => value === undefined)) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message,
    });
  }
}

const checklistSchema = z.array(checklistItemInputSchema);

const taskFieldSchemas = {
  checklist: checklistSchema,
  columnId: z.enum(TASK_BOARD_COLUMN_IDS),
  cycleAssignment: z.enum(TASK_CYCLE_ASSIGNMENT_VALUES),
  cycleSessionId: z.string().uuid().nullable(),
  description: z.string().trim().min(12).max(280),
  dueDate: isoDateSchema.nullable(),
  estimatedHours: z.number().min(0.5).max(16),
  priority: z.enum(TASK_PRIORITY_VALUES),
  projectId: z.string().uuid(),
  status: z.enum(TASK_STATUS_VALUES),
  title: z.string().trim().min(4).max(80),
} as const;

export const createTaskSchema = z.object({
  checklist: checklistSchema.default([]),
  columnId: taskFieldSchemas.columnId,
  cycleAssignment: taskFieldSchemas.cycleAssignment,
  cycleSessionId: taskFieldSchemas.cycleSessionId.default(null),
  description: taskFieldSchemas.description,
  dueDate: taskFieldSchemas.dueDate.default(null),
  estimatedHours: taskFieldSchemas.estimatedHours,
  priority: taskFieldSchemas.priority,
  projectId: taskFieldSchemas.projectId,
  status: taskFieldSchemas.status,
  title: taskFieldSchemas.title,
}).superRefine(validateBoardConsistency);

export const updateTaskSchema = z.object({
  checklist: taskFieldSchemas.checklist.optional(),
  columnId: taskFieldSchemas.columnId.optional(),
  cycleAssignment: taskFieldSchemas.cycleAssignment.optional(),
  cycleSessionId: taskFieldSchemas.cycleSessionId.optional(),
  description: taskFieldSchemas.description.nullable().optional(),
  dueDate: taskFieldSchemas.dueDate.optional(),
  estimatedHours: taskFieldSchemas.estimatedHours.optional(),
  priority: taskFieldSchemas.priority.optional(),
  projectId: taskFieldSchemas.projectId.optional(),
  status: taskFieldSchemas.status.optional(),
  title: taskFieldSchemas.title.optional(),
}).superRefine((input, context) => {
  validateNonEmptyUpdate(input, context, 'At least one task field must be provided for update.');
  validateBoardConsistency(input, context);
});

export const updateTaskStatusSchema = z.object({
  columnId: taskFieldSchemas.columnId.optional(),
  cycleAssignment: taskFieldSchemas.cycleAssignment.optional(),
  cycleSessionId: taskFieldSchemas.cycleSessionId.optional(),
  status: taskFieldSchemas.status.optional(),
}).superRefine((input, context) => {
  validateNonEmptyUpdate(input, context, 'At least one task board field must be provided for status update.');
  validateBoardConsistency(input, context);
});

export const archiveTaskSchema = z.object({}).strict();

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>;