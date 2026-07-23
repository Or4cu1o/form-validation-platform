import { distributeScoreWeights } from './score-distribution.util';

describe('distributeScoreWeights', () => {
  test('splits evenly when the division is exact', () => {
    expect(distributeScoreWeights(5)).toEqual([2, 2, 2, 2, 2]);
  });

  test('spreads the rounding remainder across the first items (largest remainder method)', () => {
    const weights = distributeScoreWeights(13);

    expect(weights).toHaveLength(13);
    expect(weights.reduce((sum, w) => sum + w, 0)).toBeCloseTo(10, 2);
    expect(weights.slice(0, 12)).toEqual(Array(12).fill(0.77));
    expect(weights[12]).toBe(0.76);
  });

  test('supports a custom total', () => {
    const weights = distributeScoreWeights(3, 1);

    expect(weights.reduce((sum, w) => sum + w, 0)).toBeCloseTo(1, 2);
  });

  test('returns an empty array when count is zero', () => {
    expect(distributeScoreWeights(0)).toEqual([]);
  });
});
