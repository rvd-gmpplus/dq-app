import type { BusinessImpact, ItDataImpact, Quadrant, UseCase } from '@/types/useCase';
import type { ScoringWeights } from '@/types/settings';

const round1 = (n: number) => Math.round(n * 10) / 10;
const THRESHOLD = 3;

type BusinessSubScores = Omit<BusinessImpact, 'score' | 'notes'>;
type ItDataSubScores = Omit<ItDataImpact, 'score' | 'notes'>;

export function computeBusinessImpactScore(
  sub: BusinessSubScores,
  weights: ScoringWeights,
): number {
  const w = weights.business;
  const totalWeight =
    w.benefitSize + w.urgency + w.stakeholderBreadth + w.timeToValue + w.enablementPotential;
  if (totalWeight === 0) {
    return round1(
      (sub.benefitSize +
        sub.urgency +
        sub.stakeholderBreadth +
        sub.timeToValue +
        sub.enablementPotential) /
        5,
    );
  }
  const weighted =
    sub.benefitSize * w.benefitSize +
    sub.urgency * w.urgency +
    sub.stakeholderBreadth * w.stakeholderBreadth +
    sub.timeToValue * w.timeToValue +
    sub.enablementPotential * w.enablementPotential;
  return round1(weighted / totalWeight);
}

export function computeItDataImpactScore(
  sub: ItDataSubScores,
  weights: ScoringWeights,
): number {
  const w = weights.itData;
  const totalWeight =
    w.dataAvailability + w.dataQuality + w.integrationComplexity + w.architecturalChange;
  if (totalWeight === 0) {
    return round1(
      (sub.dataAvailability + sub.dataQuality + sub.integrationComplexity + sub.architecturalChange) /
        4,
    );
  }
  const weighted =
    sub.dataAvailability * w.dataAvailability +
    sub.dataQuality * w.dataQuality +
    sub.integrationComplexity * w.integrationComplexity +
    sub.architecturalChange * w.architecturalChange;
  return round1(weighted / totalWeight);
}

export function deriveQuadrant(business: number, itData: number): Quadrant {
  const highBusiness = business >= THRESHOLD;
  const highIt = itData >= THRESHOLD;
  if (highBusiness && !highIt) return 'QuickWin';
  if (highBusiness && highIt) return 'Strategic';
  if (!highBusiness && !highIt) return 'Filler';
  return 'DontPursue';
}

export function recomputeUseCaseScores(uc: UseCase, weights: ScoringWeights): UseCase {
  const bi = computeBusinessImpactScore(uc.businessImpact, weights);
  const it = computeItDataImpactScore(uc.itDataImpact, weights);
  return {
    ...uc,
    businessImpact: { ...uc.businessImpact, score: bi },
    itDataImpact: { ...uc.itDataImpact, score: it },
    quadrant: deriveQuadrant(bi, it),
  };
}
