import { buildAdjustedActualHours, buildWeeklyScenario, formatWeeklyCell, getWeeklyDeviationStatus } from './weekly';

describe('weekly helpers', () => {
  it('classifies deviations by delta size', () => {
    expect(getWeeklyDeviationStatus(0.5)).toBe('balanced');
    expect(getWeeklyDeviationStatus(1.5)).toBe('attention');
    expect(getWeeklyDeviationStatus(3)).toBe('critical');
  });

  it('builds a scenario with weekly rows and summary', () => {
    const scenario = buildWeeklyScenario();

    expect(scenario.rows.length).toBeGreaterThan(0);
    expect(scenario.summary.plannedWeekHours).toBeGreaterThan(0);
    expect(scenario.rows[0]?.cells).toHaveLength(6);
  });

  it('formats weekly cells and adjusted actual hours', () => {
    const scenario = buildWeeklyScenario();
    const adjustedHours = buildAdjustedActualHours(
      scenario.rows.map((row) => ({
        projectId: row.projectId,
        projectName: row.projectName,
        colorHex: row.colorHex,
        kind: 'rotative',
        currentAllocationPct: 0,
        suggestedAllocationPct: 0,
        plannedHours: row.cells[2]?.plannedHours ?? 0,
        openTasks: 0,
        effortHours: 0,
        reason: '',
      })),
    );

    expect(formatWeeklyCell({ day: 'Seg', plannedHours: 2, actualHours: 2.5 })).toBe('2h30 / 2h00');
    expect(Object.keys(adjustedHours).length).toBeGreaterThan(0);
  });
});