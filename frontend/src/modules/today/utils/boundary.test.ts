import { getCycleBoundaryTimestamp, getLocalISODate, hasCrossedCycleBoundary, isWithinRolloverWindow } from './boundary';

describe('boundary utils', () => {
  it('builds local ISO date strings', () => {
    expect(getLocalISODate(new Date(2026, 2, 22, 10, 0, 0))).toBe('2026-03-22');
  });

  it('detects whether the cycle boundary has been crossed', () => {
    expect(hasCrossedCycleBoundary(new Date(2026, 2, 22, 23, 59, 58), '2026-03-22')).toBe(false);
    expect(hasCrossedCycleBoundary(new Date(2026, 2, 23, 0, 0, 1), '2026-03-22')).toBe(true);
  });

  it('detects the active rollover window around midnight', () => {
    expect(isWithinRolloverWindow(new Date(2026, 2, 22, 23, 56, 0), '2026-03-22')).toBe(true);
    expect(isWithinRolloverWindow(new Date(2026, 2, 23, 0, 4, 0), '2026-03-22')).toBe(true);
    expect(isWithinRolloverWindow(new Date(2026, 2, 22, 23, 40, 0), '2026-03-22')).toBe(false);
  });

  it('creates a timestamp for the end-of-day boundary', () => {
    expect(getCycleBoundaryTimestamp('2026-03-22')).toBe(new Date(2026, 2, 22, 23, 59, 59, 0).toISOString());
  });
});