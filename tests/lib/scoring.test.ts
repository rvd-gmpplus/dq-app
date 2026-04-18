import { describe, expect, it } from 'vitest';
import {
  computeBusinessImpactScore,
  computeItDataImpactScore,
  deriveQuadrant,
  recomputeUseCaseScores,
} from '@/lib/scoring';
import { DEFAULT_SCORING_WEIGHTS } from '@/types/settings';
import type { UseCase } from '@/types/useCase';

function makeUseCase(overrides: Partial<UseCase> = {}): UseCase {
  return {
    id: '00000000-0000-0000-0000-000000000000',
    code: 'UC-001',
    title: 'Test',
    status: 'Backlog',
    pillars: ['Transparency'],
    owner: 'Mirella',
    submittedBy: 'Rick',
    businessImpact: {
      score: 0,
      benefitSize: 4,
      urgency: 4,
      stakeholderBreadth: 3,
      timeToValue: 3,
      enablementPotential: 2,
    },
    itDataImpact: {
      score: 0,
      dataAvailability: 3,
      dataQuality: 3,
      integrationComplexity: 3,
      architecturalChange: 2,
    },
    quadrant: 'Filler',
    problem: '',
    objective: '',
    kpis: [],
    solutionDescription: '',
    scopeIn: [],
    scopeOut: [],
    relatedDataObjects: [],
    relatedJiraKeys: [],
    relatedPhases: [],
    linkedAttachments: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    history: [],
    comments: [],
    tags: [],
    ...overrides,
  };
}

describe('computeBusinessImpactScore', () => {
  it('computes arithmetic mean with equal weights rounded to 1 decimal', () => {
    const score = computeBusinessImpactScore(
      {
        benefitSize: 4,
        urgency: 5,
        stakeholderBreadth: 3,
        timeToValue: 4,
        enablementPotential: 5,
      },
      DEFAULT_SCORING_WEIGHTS,
    );
    expect(score).toBe(4.2);
  });

  it('applies weighted mean when weights differ', () => {
    const score = computeBusinessImpactScore(
      {
        benefitSize: 5,
        urgency: 1,
        stakeholderBreadth: 1,
        timeToValue: 1,
        enablementPotential: 1,
      },
      {
        ...DEFAULT_SCORING_WEIGHTS,
        business: {
          benefitSize: 4,
          urgency: 1,
          stakeholderBreadth: 1,
          timeToValue: 1,
          enablementPotential: 1,
        },
      },
    );
    expect(score).toBe(3.0);
  });

  it('falls back to equal weights when all weights are zero', () => {
    const score = computeBusinessImpactScore(
      {
        benefitSize: 4,
        urgency: 4,
        stakeholderBreadth: 4,
        timeToValue: 4,
        enablementPotential: 4,
      },
      {
        ...DEFAULT_SCORING_WEIGHTS,
        business: {
          benefitSize: 0,
          urgency: 0,
          stakeholderBreadth: 0,
          timeToValue: 0,
          enablementPotential: 0,
        },
      },
    );
    expect(score).toBe(4.0);
  });
});

describe('computeItDataImpactScore', () => {
  it('computes arithmetic mean with unified difficulty semantics', () => {
    const score = computeItDataImpactScore(
      {
        dataAvailability: 2,
        dataQuality: 3,
        integrationComplexity: 4,
        architecturalChange: 5,
      },
      DEFAULT_SCORING_WEIGHTS,
    );
    expect(score).toBe(3.5);
  });
});

describe('deriveQuadrant', () => {
  it('high business, low IT => QuickWin', () => {
    expect(deriveQuadrant(4.5, 2.0)).toBe('QuickWin');
  });

  it('high business, high IT => Strategic', () => {
    expect(deriveQuadrant(4.0, 4.0)).toBe('Strategic');
  });

  it('low business, low IT => Filler', () => {
    expect(deriveQuadrant(2.0, 2.0)).toBe('Filler');
  });

  it('low business, high IT => DontPursue', () => {
    expect(deriveQuadrant(2.0, 4.0)).toBe('DontPursue');
  });

  it('3.5 exactly is treated as high on both axes', () => {
    expect(deriveQuadrant(3.5, 3.5)).toBe('Strategic');
  });

  it('boundary at 3.499 is low', () => {
    expect(deriveQuadrant(3.499, 2.0)).toBe('Filler');
  });
});

describe('recomputeUseCaseScores', () => {
  it('updates score and quadrant together', () => {
    const next = recomputeUseCaseScores(makeUseCase(), DEFAULT_SCORING_WEIGHTS);
    // BI mean = (4+4+3+3+2)/5 = 3.2; IT mean = (3+3+3+2)/4 = 2.75
    expect(next.businessImpact.score).toBe(3.2);
    expect(next.itDataImpact.score).toBe(2.8);
    expect(next.quadrant).toBe('Filler');
  });

  it('promotes to QuickWin when business >= 3.5 and IT < 3.5', () => {
    const next = recomputeUseCaseScores(
      makeUseCase({
        businessImpact: {
          score: 0,
          benefitSize: 5,
          urgency: 5,
          stakeholderBreadth: 4,
          timeToValue: 4,
          enablementPotential: 4,
        },
        itDataImpact: {
          score: 0,
          dataAvailability: 2,
          dataQuality: 2,
          integrationComplexity: 2,
          architecturalChange: 2,
        },
      }),
      DEFAULT_SCORING_WEIGHTS,
    );
    expect(next.quadrant).toBe('QuickWin');
  });
});
