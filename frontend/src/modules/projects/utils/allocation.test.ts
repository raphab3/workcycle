import { mockProjects } from '@/modules/projects/mocks/projects';

import { formatFixedSchedule, getActiveAllocationTotal, getAllocationDelta, getAllocationTone } from './allocation';

describe('projects allocation helpers', () => {
  it('sums only active projects', () => {
    expect(getActiveAllocationTotal(mockProjects)).toBe(55);
  });

  it('returns under tone when allocation is below 100%', () => {
    expect(getAllocationDelta(mockProjects)).toBe(45);
    expect(getAllocationTone(mockProjects)).toBe('under');
  });

  it('formats fixed schedule copy', () => {
    expect(formatFixedSchedule(mockProjects[0])).toContain('Seg · Ter · Qua · Qui · Sex');
  });
});