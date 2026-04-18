import { beforeEach, describe, expect, it } from 'vitest';
import { usePhaseStore } from '@/stores/phaseStore';
import { useRiskStore } from '@/stores/riskStore';
import { useStakeholderStore } from '@/stores/stakeholderStore';
import { useDataObjectStore } from '@/stores/dataObjectStore';
import { useRaciStore } from '@/stores/raciStore';
import { usePillarStore } from '@/stores/pillarStore';

beforeEach(() => {
  localStorage.clear();
  usePhaseStore.getState().reset();
  useRiskStore.getState().reset();
  useStakeholderStore.getState().reset();
  useDataObjectStore.getState().reset();
  useRaciStore.getState().reset();
  usePillarStore.getState().reset();
});

describe('phaseStore', () => {
  it('toggleDeliverable flips the done flag', () => {
    usePhaseStore.getState().replaceAll([
      {
        id: 1,
        name: 'Preparation',
        status: 'Completed',
        plannedStart: '2025-10-01',
        plannedEnd: '2025-12-31',
        deliverables: [{ name: 'Kickoff', done: false }],
        blockers: [],
      },
    ]);
    usePhaseStore.getState().toggleDeliverable(1, 'Kickoff');
    expect(usePhaseStore.getState().getById(1)!.deliverables[0]!.done).toBe(true);
  });
});

describe('riskStore', () => {
  it('derives score from likelihood * impact on create and update', () => {
    const r = useRiskStore.getState().create({
      title: 'Adoption',
      likelihood: 3,
      impact: 4,
      mitigation: '...',
      owner: 'Mirella',
      status: 'Open',
    });
    expect(r.score).toBe(12);
    useRiskStore.getState().update(r.id, { likelihood: 5 });
    expect(useRiskStore.getState().getById(r.id)!.score).toBe(20);
  });

  it('sorts by score descending', () => {
    useRiskStore.getState().create({
      title: 'A', likelihood: 2, impact: 2, mitigation: '', owner: 'x', status: 'Open',
    });
    useRiskStore.getState().create({
      title: 'B', likelihood: 5, impact: 5, mitigation: '', owner: 'x', status: 'Open',
    });
    const list = useRiskStore.getState().list();
    expect(list[0]!.title).toBe('B');
  });
});

describe('stakeholderStore', () => {
  it('byGroup filters correctly', () => {
    useStakeholderStore.getState().create({
      name: 'Mirella', role: 'PM', group: 'Internal', raci: 'R',
    });
    useStakeholderStore.getState().create({
      name: 'Martin', role: 'Sponsor', group: 'Sponsor', raci: 'A',
    });
    expect(useStakeholderStore.getState().byGroup('Internal')).toHaveLength(1);
    expect(useStakeholderStore.getState().byGroup('Sponsor')).toHaveLength(1);
  });
});

describe('dataObjectStore', () => {
  it('create then lookup by name', () => {
    useDataObjectStore.getState().create({
      name: 'Account', owner: 'Mirella', system: 'D365 CE', sensitivity: 'Medium', relatedUseCases: [],
    });
    expect(useDataObjectStore.getState().getByName('Account')).toBeDefined();
  });
});

describe('raciStore', () => {
  it('setCell creates, updates, and clears a designation', () => {
    const sId = '11111111-1111-4111-8111-111111111111';
    const oId = '22222222-2222-4222-8222-222222222222';
    useRaciStore.getState().setCell(sId, oId, 'R');
    expect(useRaciStore.getState().getCell(sId, oId)!.designation).toBe('R');
    useRaciStore.getState().setCell(sId, oId, 'A');
    expect(useRaciStore.getState().getCell(sId, oId)!.designation).toBe('A');
    useRaciStore.getState().setCell(sId, oId, null);
    expect(useRaciStore.getState().getCell(sId, oId)).toBeUndefined();
  });
});

describe('pillarStore', () => {
  it('setAmbition updates the matching pillar record', () => {
    usePillarStore.getState().replaceAll([
      {
        pillar: 'Transparency', priority: 1, displayName: 'Transparency in the Chain',
        ambition: 'old', ogsmTargets: [], legacyMapping: '', keyDataObjectIds: [],
      },
    ]);
    usePillarStore.getState().setAmbition('Transparency', 'new');
    expect(usePillarStore.getState().get('Transparency')!.ambition).toBe('new');
  });

  it('list sorts by priority', () => {
    usePillarStore.getState().replaceAll([
      {
        pillar: 'Market', priority: 3, displayName: 'Market Development',
        ambition: '', ogsmTargets: [], legacyMapping: '', keyDataObjectIds: [],
      },
      {
        pillar: 'Transparency', priority: 1, displayName: 'Transparency in the Chain',
        ambition: '', ogsmTargets: [], legacyMapping: '', keyDataObjectIds: [],
      },
      {
        pillar: 'Insight', priority: 2, displayName: 'Insight-Driven Decision-Making',
        ambition: '', ogsmTargets: [], legacyMapping: '', keyDataObjectIds: [],
      },
    ]);
    const list = usePillarStore.getState().list();
    expect(list.map((p) => p.pillar)).toEqual(['Transparency', 'Insight', 'Market']);
  });
});
