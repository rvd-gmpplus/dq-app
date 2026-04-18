import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
  seedUseCases,
  seedPhases,
  seedRisks,
  seedStakeholders,
  seedDataObjects,
  seedPillars,
} from '@/seed';
import { UseCaseSchema } from '@/types/useCase';
import { PhaseSchema } from '@/types/phase';
import { RiskSchema } from '@/types/risk';
import { StakeholderSchema } from '@/types/stakeholder';
import { DataObjectSchema } from '@/types/dataObject';
import { PillarMetadataSchema } from '@/types/pillarMetadata';

describe('seed data', () => {
  it.each([
    ['useCases', seedUseCases, UseCaseSchema],
    ['phases', seedPhases, PhaseSchema],
    ['risks', seedRisks, RiskSchema],
    ['stakeholders', seedStakeholders, StakeholderSchema],
    ['dataObjects', seedDataObjects, DataObjectSchema],
    ['pillars', seedPillars, PillarMetadataSchema],
  ])('%s validates against the schema', (_name, rows, schema) => {
    const parsed = z.array(schema as z.ZodTypeAny).safeParse(rows);
    if (!parsed.success) {
      throw new Error(JSON.stringify(parsed.error.issues, null, 2));
    }
  });

  it('has at least one use case per quadrant so the quadrant view renders a full palette', () => {
    const quadrants = new Set(seedUseCases.map((u) => u.quadrant));
    expect(quadrants.has('QuickWin')).toBe(true);
    expect(quadrants.has('Strategic')).toBe(true);
    expect(quadrants.has('Filler')).toBe(true);
    expect(quadrants.has('DontPursue')).toBe(true);
  });

  it('seeds the three priority-ordered pillars', () => {
    const byPriority = [...seedPillars].sort((a, b) => a.priority - b.priority);
    expect(byPriority.map((p) => p.pillar)).toEqual(['Transparency', 'Insight', 'Market']);
  });

  it('seeds the expected five strategy risks', () => {
    expect(seedRisks).toHaveLength(5);
  });

  it('every use case references known data objects by name', () => {
    const names = new Set(seedDataObjects.map((d) => d.name));
    for (const uc of seedUseCases) {
      for (const n of uc.relatedDataObjects) {
        expect(names.has(n), `${uc.code} references unknown data object ${n}`).toBe(true);
      }
    }
  });
});
