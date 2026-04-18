import { useEffect } from 'react';
import {
  seedUseCases,
  seedPhases,
  seedRisks,
  seedStakeholders,
  seedDataObjects,
  seedPillars,
} from '@/seed';
import { useUseCaseStore } from '@/stores/useCaseStore';
import { usePhaseStore } from '@/stores/phaseStore';
import { useRiskStore } from '@/stores/riskStore';
import { useStakeholderStore } from '@/stores/stakeholderStore';
import { useDataObjectStore } from '@/stores/dataObjectStore';
import { usePillarStore } from '@/stores/pillarStore';

const FLAG = 'dq:first-run-complete';

export function useFirstRun(): void {
  useEffect(() => {
    if (localStorage.getItem(FLAG)) return;
    useUseCaseStore.getState().replaceAll(seedUseCases);
    usePhaseStore.getState().replaceAll(seedPhases);
    useRiskStore.getState().replaceAll(seedRisks);
    useStakeholderStore.getState().replaceAll(seedStakeholders);
    useDataObjectStore.getState().replaceAll(seedDataObjects);
    usePillarStore.getState().replaceAll(seedPillars);
    localStorage.setItem(FLAG, new Date().toISOString());
  }, []);
}
