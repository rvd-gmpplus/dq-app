import { describe, expect, it } from 'vitest';
import { suggestSubScores } from '@/lib/rescoreSuggest';
import { DEFAULT_SCORING_WEIGHTS } from '@/types/settings';

const bw = DEFAULT_SCORING_WEIGHTS.business;
const iw = DEFAULT_SCORING_WEIGHTS.itData;

describe('suggestSubScores (business axis)', () => {
  it('returns integer sub-scores clamped to [1, 5]', () => {
    const { subScores } = suggestSubScores(
      { benefitSize: 3, urgency: 3, stakeholderBreadth: 3, timeToValue: 3, enablementPotential: 3 },
      4.2,
      bw,
    );
    for (const v of Object.values(subScores)) {
      expect(Number.isInteger(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(5);
    }
  });

  it('reaches a mean close to the target', () => {
    const { achievedMean } = suggestSubScores(
      { benefitSize: 3, urgency: 3, stakeholderBreadth: 3, timeToValue: 3, enablementPotential: 3 },
      4.2,
      bw,
    );
    expect(Math.abs(achievedMean - 4.2)).toBeLessThanOrEqual(0.1);
  });

  it('saturates at 5 when target exceeds 5', () => {
    const { subScores, achievedMean } = suggestSubScores(
      { benefitSize: 5, urgency: 5, stakeholderBreadth: 5, timeToValue: 5, enablementPotential: 5 },
      6,
      bw,
    );
    expect(achievedMean).toBe(5);
    expect(Object.values(subScores).every((v) => v === 5)).toBe(true);
  });

  it('saturates at 1 when target falls below 1', () => {
    const { subScores, achievedMean } = suggestSubScores(
      { benefitSize: 1, urgency: 1, stakeholderBreadth: 1, timeToValue: 1, enablementPotential: 1 },
      0.2,
      bw,
    );
    expect(achievedMean).toBe(1);
    expect(Object.values(subScores).every((v) => v === 1)).toBe(true);
  });

  it('minimises moves from current sub-scores', () => {
    const { subScores } = suggestSubScores(
      { benefitSize: 2, urgency: 2, stakeholderBreadth: 5, timeToValue: 2, enablementPotential: 2 },
      3.0,
      bw,
    );
    // stakeholderBreadth was already at 5; the algorithm should not pull it down just to hit the target.
    expect(subScores.stakeholderBreadth).toBe(5);
  });

  it('returns current when already at the target', () => {
    const { subScores } = suggestSubScores(
      { benefitSize: 4, urgency: 4, stakeholderBreadth: 4, timeToValue: 4, enablementPotential: 4 },
      4.0,
      bw,
    );
    expect(subScores).toEqual({
      benefitSize: 4,
      urgency: 4,
      stakeholderBreadth: 4,
      timeToValue: 4,
      enablementPotential: 4,
    });
  });

  it('respects non-uniform weights', () => {
    const w = {
      ...bw,
      benefitSize: 4,
      urgency: 1,
      stakeholderBreadth: 1,
      timeToValue: 1,
      enablementPotential: 1,
    };
    const { subScores, achievedMean } = suggestSubScores(
      { benefitSize: 1, urgency: 5, stakeholderBreadth: 5, timeToValue: 5, enablementPotential: 5 },
      3.5,
      w,
    );
    expect(Math.abs(achievedMean - 3.5)).toBeLessThanOrEqual(0.15);
    for (const v of Object.values(subScores)) {
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(5);
    }
  });
});

describe('suggestSubScores (IT / Data axis)', () => {
  it('works on four sub-scores too', () => {
    const { subScores, achievedMean } = suggestSubScores(
      { dataAvailability: 2, dataQuality: 2, integrationComplexity: 2, architecturalChange: 2 },
      4.0,
      iw,
    );
    expect(Math.abs(achievedMean - 4.0)).toBeLessThanOrEqual(0.1);
    for (const v of Object.values(subScores)) {
      expect(Number.isInteger(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(5);
    }
  });
});
