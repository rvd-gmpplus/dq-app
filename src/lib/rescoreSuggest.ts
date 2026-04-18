/**
 * Suggest integer sub-scores (each 1..5) that produce an aggregate weighted
 * mean as close to the target as possible while minimising the total number
 * of steps away from the current sub-scores.
 *
 * Algorithm: hill-climb on single-step integer moves, scored by (a) distance
 * from the target mean and (b) total moves from the current state. A move
 * is accepted only if it strictly improves distance-to-target; ties prefer
 * the smallest total moves.
 */

export type SubScoreMap = Record<string, number>;
export type WeightMap = Record<string, number>;

export type Suggestion<T extends SubScoreMap> = {
  subScores: T;
  achievedMean: number;
};

const round1 = (n: number) => Math.round(n * 10) / 10;

function weightedMean(scores: SubScoreMap, weights: WeightMap): number {
  let wsum = 0;
  let total = 0;
  for (const k of Object.keys(scores)) {
    const w = weights[k] ?? 1;
    wsum += (scores[k] ?? 0) * w;
    total += w;
  }
  if (total === 0) {
    const values = Object.values(scores);
    return values.reduce((a, b) => a + b, 0) / values.length;
  }
  return wsum / total;
}

export function suggestSubScores<T extends SubScoreMap>(
  current: T,
  targetMean: number,
  weights: WeightMap,
): Suggestion<T> {
  const keys = Object.keys(current);
  const state: SubScoreMap = { ...current };

  const distance = (mean: number) => Math.abs(mean - targetMean);

  let currentMean = weightedMean(state, weights);
  let currentDistance = distance(currentMean);

  // Cap iterations to defend against pathological inputs (shouldn't happen
  // for N in {4, 5} with integer sub-scores).
  for (let iter = 0; iter < 200; iter++) {
    let bestKey: string | null = null;
    let bestDelta = 0;
    let bestDistance = currentDistance;

    for (const k of keys) {
      const cur = state[k]!;
      for (const step of [1, -1]) {
        const next = cur + step;
        if (next < 1 || next > 5) continue;
        const candidate = { ...state, [k]: next };
        const mean = weightedMean(candidate, weights);
        const d = distance(mean);
        if (d < bestDistance - 1e-9) {
          bestKey = k;
          bestDelta = step;
          bestDistance = d;
        }
      }
    }

    if (bestKey === null) break;
    state[bestKey] = state[bestKey]! + bestDelta;
    currentMean = weightedMean(state, weights);
    currentDistance = distance(currentMean);
    if (currentDistance < 1e-9) break;
  }

  return {
    subScores: state as T,
    achievedMean: round1(currentMean),
  };
}
