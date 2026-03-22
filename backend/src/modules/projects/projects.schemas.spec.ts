import assert from 'node:assert/strict';
import test from 'node:test';

import { createProjectSchema, toggleProjectStatusSchema, updateProjectSchema } from '@/modules/projects/projects.schemas';

test('createProjectSchema accepts the frontend-compatible payload', () => {
  const parsed = createProjectSchema.parse({
    allocationPct: 40,
    colorHex: '#506169',
    fixedDays: ['Seg', 'Qua'],
    fixedHoursPerDay: 2,
    name: 'ClienteCore',
    sprintDays: 14,
    status: 'active',
    type: 'rotative',
  });

  assert.deepEqual(parsed, {
    allocationPct: 40,
    colorHex: '#506169',
    fixedDays: ['Seg', 'Qua'],
    fixedHoursPerDay: 2,
    name: 'ClienteCore',
    sprintDays: 14,
    status: 'active',
    type: 'rotative',
  });
});

test('updateProjectSchema rejects empty partial updates', () => {
  assert.throws(() => updateProjectSchema.parse({}), /At least one project field must be provided for update\./);
});

test('toggleProjectStatusSchema rejects invalid statuses', () => {
  assert.throws(() => toggleProjectStatusSchema.parse({ status: 'archived' }), /Invalid option/);
});