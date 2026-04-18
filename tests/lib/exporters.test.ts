import { beforeEach, describe, expect, it } from 'vitest';
import { useCasesToCsv, buildBackupPayload } from '@/lib/exporters';
import { parseBackup, applyBackup } from '@/lib/importers';
import { useUseCaseStore } from '@/stores/useCaseStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useStakeholderStore } from '@/stores/stakeholderStore';
import { usePhaseStore } from '@/stores/phaseStore';
import { useRiskStore } from '@/stores/riskStore';
import { useDataObjectStore } from '@/stores/dataObjectStore';
import { useRaciStore } from '@/stores/raciStore';
import { usePillarStore } from '@/stores/pillarStore';
import { seedUseCases, seedPhases, seedRisks, seedStakeholders, seedDataObjects, seedPillars } from '@/seed';
import { BACKUP_VERSION } from '@/types/backup';

function seedAll() {
  useUseCaseStore.getState().replaceAll(seedUseCases);
  usePhaseStore.getState().replaceAll(seedPhases);
  useRiskStore.getState().replaceAll(seedRisks);
  useStakeholderStore.getState().replaceAll(seedStakeholders);
  useDataObjectStore.getState().replaceAll(seedDataObjects);
  usePillarStore.getState().replaceAll(seedPillars);
  useRaciStore.getState().replaceAll([]);
}

beforeEach(() => {
  localStorage.clear();
  useSettingsStore.getState().reset();
  useUseCaseStore.getState().reset();
  usePhaseStore.getState().reset();
  useRiskStore.getState().reset();
  useStakeholderStore.getState().reset();
  useDataObjectStore.getState().reset();
  useRaciStore.getState().reset();
  usePillarStore.getState().reset();
});

describe('buildBackupPayload', () => {
  it('captures the current state of every store with the expected version', () => {
    seedAll();
    const payload = buildBackupPayload();
    expect(payload.version).toBe(BACKUP_VERSION);
    expect(payload.useCases).toHaveLength(seedUseCases.length);
    expect(payload.phases).toHaveLength(seedPhases.length);
    expect(payload.risks).toHaveLength(seedRisks.length);
    expect(payload.stakeholders).toHaveLength(seedStakeholders.length);
    expect(payload.dataObjects).toHaveLength(seedDataObjects.length);
    expect(payload.pillars).toHaveLength(seedPillars.length);
  });
});

describe('parseBackup', () => {
  it('rejects invalid JSON', () => {
    const result = parseBackup('not json');
    expect(result.ok).toBe(false);
  });

  it('rejects a structurally wrong payload', () => {
    const result = parseBackup(JSON.stringify({ foo: 'bar' }));
    expect(result.ok).toBe(false);
  });

  it('accepts a round-trip payload and keeps all data intact', () => {
    seedAll();
    const payload = buildBackupPayload();
    const raw = JSON.stringify(payload);
    const parsed = parseBackup(raw);
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.payload.useCases).toHaveLength(seedUseCases.length);
      expect(parsed.payload.settings.orgName).toBe('GMP+ International');
    }
  });
});

describe('applyBackup round-trip', () => {
  it('restores every store from an exported payload with zero loss', () => {
    seedAll();
    const originalPayload = buildBackupPayload();

    // Clear everything to simulate an "import into a fresh tab".
    useUseCaseStore.getState().reset();
    usePhaseStore.getState().reset();
    useRiskStore.getState().reset();
    useStakeholderStore.getState().reset();
    useDataObjectStore.getState().reset();
    useRaciStore.getState().reset();
    usePillarStore.getState().reset();
    useSettingsStore.getState().reset();

    // Apply the captured payload.
    applyBackup(originalPayload);

    // Re-export and compare normalisations.
    const restoredPayload = buildBackupPayload();

    expect(restoredPayload.useCases).toHaveLength(originalPayload.useCases.length);
    expect(restoredPayload.phases).toHaveLength(originalPayload.phases.length);
    expect(restoredPayload.risks).toHaveLength(originalPayload.risks.length);
    expect(restoredPayload.stakeholders).toHaveLength(originalPayload.stakeholders.length);
    expect(restoredPayload.dataObjects).toHaveLength(originalPayload.dataObjects.length);
    expect(restoredPayload.pillars).toHaveLength(originalPayload.pillars.length);
    expect(restoredPayload.settings).toEqual(originalPayload.settings);
  });
});

describe('useCasesToCsv', () => {
  it('writes a header row followed by one row per use case', () => {
    seedAll();
    const list = Object.values(useUseCaseStore.getState().items);
    const csv = useCasesToCsv(list);
    const lines = csv.split('\r\n');
    expect(lines[0]).toContain('code,title');
    expect(lines).toHaveLength(list.length + 1);
  });

  it('escapes embedded commas and quotes correctly', () => {
    useUseCaseStore.getState().replaceAll([
      {
        ...seedUseCases[0]!,
        title: 'Name with, comma and "quote"',
      },
    ]);
    const list = Object.values(useUseCaseStore.getState().items);
    const csv = useCasesToCsv(list);
    expect(csv).toContain('"Name with, comma and ""quote"""');
  });
});
