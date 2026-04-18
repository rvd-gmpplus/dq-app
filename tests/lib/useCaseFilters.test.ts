import { describe, expect, it } from 'vitest';
import { filterUseCases, sortUseCases } from '@/lib/useCaseFilters';
import type { UseCase } from '@/types/useCase';

function uc(over: Partial<UseCase> & Pick<UseCase, 'id' | 'code' | 'title'>): UseCase {
  return {
    status: 'Backlog',
    pillars: ['Transparency'],
    owner: 'Mirella',
    submittedBy: 'Rick',
    businessImpact: {
      score: 3,
      benefitSize: 3, urgency: 3, stakeholderBreadth: 3, timeToValue: 3, enablementPotential: 3,
    },
    itDataImpact: {
      score: 3,
      dataAvailability: 3, dataQuality: 3, integrationComplexity: 3, architecturalChange: 3,
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
    ...over,
  };
}

describe('filterUseCases', () => {
  const list = [
    uc({ id: '1', code: 'UC-001', title: 'Business request', pillars: ['Transparency'], quadrant: 'Strategic', status: 'Backlog' }),
    uc({ id: '2', code: 'UC-002', title: 'Dashboard for MT', pillars: ['Insight'], quadrant: 'QuickWin', status: 'In Progress' }),
    uc({ id: '3', code: 'UC-003', title: 'Newsletter cleanup', pillars: ['Market'], quadrant: 'Filler', status: 'Backlog', owner: 'Stan' }),
    uc({ id: '4', code: 'UC-004', title: 'Retention policy', pillars: ['Transparency'], quadrant: 'DontPursue', status: 'Rejected', tags: ['compliance'] }),
  ];

  it('returns everything with no filter', () => {
    expect(filterUseCases(list, {})).toHaveLength(4);
  });

  it('filters by pillar (OR within the filter)', () => {
    const out = filterUseCases(list, { pillars: ['Insight', 'Market'] });
    expect(out.map((u) => u.code)).toEqual(['UC-002', 'UC-003']);
  });

  it('filters by status', () => {
    const out = filterUseCases(list, { statuses: ['In Progress'] });
    expect(out.map((u) => u.code)).toEqual(['UC-002']);
  });

  it('filters by quadrant', () => {
    const out = filterUseCases(list, { quadrants: ['DontPursue'] });
    expect(out.map((u) => u.code)).toEqual(['UC-004']);
  });

  it('filters by owner substring', () => {
    const out = filterUseCases(list, { owner: 'stan' });
    expect(out.map((u) => u.code)).toEqual(['UC-003']);
  });

  it('filters by tag substring', () => {
    const out = filterUseCases(list, { tag: 'compli' });
    expect(out.map((u) => u.code)).toEqual(['UC-004']);
  });

  it('filters by full-text search across code, title, owner, problem', () => {
    const out = filterUseCases(list, { search: 'dashboard' });
    expect(out.map((u) => u.code)).toEqual(['UC-002']);
  });

  it('composes multiple filters with AND', () => {
    const out = filterUseCases(list, {
      pillars: ['Transparency'],
      statuses: ['Backlog'],
    });
    expect(out.map((u) => u.code)).toEqual(['UC-001']);
  });
});

describe('sortUseCases', () => {
  const list = [
    uc({ id: '1', code: 'UC-002', title: 'Second', businessImpact: { score: 2, benefitSize: 2, urgency: 2, stakeholderBreadth: 2, timeToValue: 2, enablementPotential: 2 } }),
    uc({ id: '2', code: 'UC-001', title: 'First', businessImpact: { score: 4, benefitSize: 4, urgency: 4, stakeholderBreadth: 4, timeToValue: 4, enablementPotential: 4 } }),
  ];

  it('sorts by code ascending', () => {
    const out = sortUseCases(list, 'code', 'asc');
    expect(out.map((u) => u.code)).toEqual(['UC-001', 'UC-002']);
  });

  it('sorts by businessImpact descending', () => {
    const out = sortUseCases(list, 'businessImpact', 'desc');
    expect(out.map((u) => u.code)).toEqual(['UC-001', 'UC-002']);
  });
});
