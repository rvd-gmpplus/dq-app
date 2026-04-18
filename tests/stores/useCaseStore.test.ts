import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useUseCaseStore } from '@/stores/useCaseStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { DEFAULT_SCORING_WEIGHTS } from '@/types/settings';

beforeEach(() => {
  localStorage.clear();
  useSettingsStore.getState().reset();
  useUseCaseStore.getState().reset();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useCaseStore', () => {
  it('creates a scored use case with UC-001 code and a create history entry', () => {
    const uc = useUseCaseStore.getState().create({
      title: 'First use case',
      pillars: ['Transparency'],
      owner: 'Mirella',
      submittedBy: 'Rick',
      businessImpact: {
        benefitSize: 3,
        urgency: 4,
        stakeholderBreadth: 3,
        timeToValue: 3,
        enablementPotential: 3,
      },
      itDataImpact: {
        dataAvailability: 2,
        dataQuality: 2,
        integrationComplexity: 3,
        architecturalChange: 2,
      },
    });
    expect(uc.code).toBe('UC-001');
    expect(uc.status).toBe('Backlog');
    expect(uc.history).toHaveLength(1);
    expect(uc.history[0]!.action).toBe('create');
  });

  it('creates an Idea when no scores are provided', () => {
    const uc = useUseCaseStore.getState().create({
      title: 'Unscored',
      pillars: ['Insight'],
      owner: 'Stan',
      submittedBy: 'Stan',
    });
    expect(uc.status).toBe('Idea');
  });

  it('auto-increments UC codes across creates', () => {
    for (let i = 0; i < 3; i++) {
      useUseCaseStore.getState().create({
        title: `uc${i}`,
        pillars: ['Market'],
        owner: 'A',
        submittedBy: 'A',
      });
    }
    const codes = useUseCaseStore.getState().list().map((u) => u.code);
    expect(codes).toEqual(['UC-001', 'UC-002', 'UC-003']);
  });

  it('updateScores recomputes aggregate score and quadrant and logs diffs', () => {
    useUseCaseStore.getState().create({
      title: 'x',
      pillars: ['Insight'],
      owner: 'A',
      submittedBy: 'A',
    });
    const id = useUseCaseStore.getState().list()[0]!.id;
    useUseCaseStore.getState().updateScores(id, {
      businessImpact: {
        benefitSize: 5,
        urgency: 5,
        stakeholderBreadth: 5,
        timeToValue: 5,
        enablementPotential: 5,
      },
      itDataImpact: {
        dataAvailability: 1,
        dataQuality: 1,
        integrationComplexity: 1,
        architecturalChange: 1,
      },
    });
    const uc = useUseCaseStore.getState().getById(id)!;
    expect(uc.businessImpact.score).toBe(5);
    expect(uc.itDataImpact.score).toBe(1);
    expect(uc.quadrant).toBe('QuickWin');
    expect(uc.history.at(-1)!.action).toBe('score');
    expect(uc.history.at(-1)!.diffs!.length).toBeGreaterThan(0);
  });

  it('update records field-level diffs and bumps updatedAt', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-18T10:00:00.000Z'));
    const uc = useUseCaseStore.getState().create({
      title: 'orig',
      pillars: ['Transparency'],
      owner: 'A',
      submittedBy: 'A',
    });
    const originalUpdatedAt = uc.updatedAt;
    vi.setSystemTime(new Date('2026-04-18T10:00:05.000Z'));
    useUseCaseStore.getState().update(uc.id, { title: 'renamed' });
    const updated = useUseCaseStore.getState().getById(uc.id)!;
    expect(updated.title).toBe('renamed');
    expect(updated.updatedAt).not.toBe(originalUpdatedAt);
    expect(updated.history.at(-1)!.diffs).toContainEqual({
      field: 'title',
      before: 'orig',
      after: 'renamed',
    });
  });

  it('bulkUpdateStatus changes status and logs one history entry per change', () => {
    for (let i = 0; i < 3; i++) {
      useUseCaseStore.getState().create({
        title: `uc${i}`,
        pillars: ['Market'],
        owner: 'A',
        submittedBy: 'A',
      });
    }
    const ids = useUseCaseStore.getState().list().map((u) => u.id);
    useUseCaseStore.getState().bulkUpdateStatus(ids, 'Parked');
    expect(useUseCaseStore.getState().list().every((u) => u.status === 'Parked')).toBe(true);
    const uc = useUseCaseStore.getState().list()[0]!;
    expect(uc.history.at(-1)!.action).toBe('status:Parked');
  });

  it('addComment appends with attribution from settings.currentUser', () => {
    useSettingsStore.getState().setCurrentUser('Stan Hendriks');
    const uc = useUseCaseStore.getState().create({
      title: 'x',
      pillars: ['Insight'],
      owner: 'A',
      submittedBy: 'A',
    });
    useUseCaseStore.getState().addComment(uc.id, 'Looks good');
    const updated = useUseCaseStore.getState().getById(uc.id)!;
    expect(updated.comments).toHaveLength(1);
    expect(updated.comments[0]!.by).toBe('Stan Hendriks');
    expect(updated.comments[0]!.text).toBe('Looks good');
  });

  it('remove deletes a use case', () => {
    const uc = useUseCaseStore.getState().create({
      title: 'gone',
      pillars: ['Transparency'],
      owner: 'A',
      submittedBy: 'A',
    });
    useUseCaseStore.getState().remove(uc.id);
    expect(useUseCaseStore.getState().list()).toHaveLength(0);
  });

  it('respects scoring weights from settingsStore', () => {
    useSettingsStore.getState().setWeights({
      ...DEFAULT_SCORING_WEIGHTS,
      business: {
        ...DEFAULT_SCORING_WEIGHTS.business,
        benefitSize: 4,
      },
    });
    const uc = useUseCaseStore.getState().create({
      title: 'weighted',
      pillars: ['Transparency'],
      owner: 'A',
      submittedBy: 'A',
      businessImpact: {
        benefitSize: 5,
        urgency: 1,
        stakeholderBreadth: 1,
        timeToValue: 1,
        enablementPotential: 1,
      },
      itDataImpact: {
        dataAvailability: 1,
        dataQuality: 1,
        integrationComplexity: 1,
        architecturalChange: 1,
      },
    });
    expect(uc.businessImpact.score).toBe(3.0);
  });

  it('replaceAll substitutes the whole collection and keyed by id', () => {
    useUseCaseStore.getState().create({
      title: 'one',
      pillars: ['Transparency'],
      owner: 'A',
      submittedBy: 'A',
    });
    const anotherId = '22222222-2222-4222-8222-222222222222';
    useUseCaseStore.getState().replaceAll([
      {
        id: anotherId,
        code: 'UC-050',
        title: 'imported',
        status: 'Backlog',
        pillars: ['Market'],
        owner: 'X',
        submittedBy: 'X',
        businessImpact: {
          score: 3,
          benefitSize: 3, urgency: 3, stakeholderBreadth: 3, timeToValue: 3, enablementPotential: 3,
        },
        itDataImpact: {
          score: 3,
          dataAvailability: 3, dataQuality: 3, integrationComplexity: 3, architecturalChange: 3,
        },
        quadrant: 'Filler',
        problem: '', objective: '', kpis: [], solutionDescription: '', scopeIn: [], scopeOut: [],
        relatedDataObjects: [], relatedJiraKeys: [], relatedPhases: [], linkedAttachments: [],
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        history: [], comments: [], tags: [],
      },
    ]);
    const list = useUseCaseStore.getState().list();
    expect(list).toHaveLength(1);
    expect(list[0]!.id).toBe(anotherId);
  });
});
