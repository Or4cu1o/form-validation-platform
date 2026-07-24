import { describe, expect, it } from 'vitest';
import { buildLastSixMonthsScoreTrend } from './score-trend';
import { makeReportInstance } from '../test/fixtures';

const REFERENCE_DATE = new Date(Date.UTC(2026, 5, 15)); // 2026-06-15

describe('buildLastSixMonthsScoreTrend', () => {
  it('builds a fixed 6-month window ending at the reference month', () => {
    const points = buildLastSixMonthsScoreTrend([], REFERENCE_DATE);

    expect(points).toHaveLength(6);
    expect(points.map((point) => point.label)).toEqual(['jan', 'fev', 'mar', 'abr', 'mai', 'jun']);
    expect(points.every((point) => point.value === null)).toBe(true);
  });

  it('fills in the score for months with a concluded, scored report', () => {
    const reports = [
      makeReportInstance({ status: 'CONCLUIDO', referenceMonth: '2026-04-01', totalScore: '7.5' }),
      makeReportInstance({ status: 'CONCLUIDO', referenceMonth: '2026-06-01', totalScore: '9' }),
    ];

    const points = buildLastSixMonthsScoreTrend(reports, REFERENCE_DATE);

    expect(points.find((point) => point.label === 'abr')?.value).toBe(7.5);
    expect(points.find((point) => point.label === 'jun')?.value).toBe(9);
    expect(points.find((point) => point.label === 'mai')?.value).toBeNull();
  });

  it('ignores reports that are not CONCLUIDO or have no score yet', () => {
    const reports = [
      makeReportInstance({ status: 'PENDENTE', referenceMonth: '2026-06-01', totalScore: null }),
      makeReportInstance({ status: 'EM_REVISAO', referenceMonth: '2026-05-01', totalScore: null }),
    ];

    const points = buildLastSixMonthsScoreTrend(reports, REFERENCE_DATE);

    expect(points.every((point) => point.value === null)).toBe(true);
  });
});
