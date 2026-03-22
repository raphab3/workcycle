import assert from 'node:assert/strict';
import test from 'node:test';

import { toProjectResponse } from '@/modules/projects/types/project';

test('toProjectResponse hides persistence-only project fields', () => {
  const response = toProjectResponse({
    allocationPct: 40,
    colorHex: '#506169',
    createdAt: new Date('2026-03-22T10:00:00.000Z'),
    fixedDays: ['Seg', 'Qua'],
    fixedHoursPerDay: 2,
    id: 'project-1',
    name: 'ClienteCore',
    sprintDays: 14,
    status: 'active',
    type: 'rotative',
    updatedAt: new Date('2026-03-22T12:00:00.000Z'),
    userId: 'user-1',
  });

  assert.deepEqual(response, {
    allocationPct: 40,
    colorHex: '#506169',
    fixedDays: ['Seg', 'Qua'],
    fixedHoursPerDay: 2,
    id: 'project-1',
    name: 'ClienteCore',
    sprintDays: 14,
    status: 'active',
    type: 'rotative',
  });
});