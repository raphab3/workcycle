export function getLocalISODate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function getCycleBoundaryDate(cycleDate: string) {
  const [year, month, day] = cycleDate.split('-').map(Number);

  return new Date(year, (month ?? 1) - 1, day ?? 1, 23, 59, 59, 0);
}

export function getCycleBoundaryTimestamp(cycleDate: string) {
  return getCycleBoundaryDate(cycleDate).toISOString();
}

export function hasCrossedCycleBoundary(currentTime: Date, cycleDate: string) {
  return getLocalISODate(currentTime) > cycleDate;
}

export function isWithinRolloverWindow(currentTime: Date, cycleDate: string) {
  const boundaryDate = getCycleBoundaryDate(cycleDate);
  const windowStart = new Date(boundaryDate.getTime() - 4 * 60_000);
  const windowEnd = new Date(boundaryDate.getTime() + 5 * 60_000);

  return currentTime >= windowStart && currentTime <= windowEnd;
}