import { BackupPayloadSchema, type BackupPayload } from '@/types/backup';
import { useUseCaseStore } from '@/stores/useCaseStore';
import { usePhaseStore } from '@/stores/phaseStore';
import { useRiskStore } from '@/stores/riskStore';
import { useStakeholderStore } from '@/stores/stakeholderStore';
import { useDataObjectStore } from '@/stores/dataObjectStore';
import { useRaciStore } from '@/stores/raciStore';
import { usePillarStore } from '@/stores/pillarStore';
import { useSettingsStore } from '@/stores/settingsStore';

export type ImportResult =
  | { ok: true; payload: BackupPayload }
  | { ok: false; error: string; issues?: unknown };

export function parseBackup(raw: string): ImportResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    return { ok: false, error: 'File is not valid JSON.' };
  }
  const result = BackupPayloadSchema.safeParse(parsed);
  if (!result.success) {
    return {
      ok: false,
      error: 'Backup shape is invalid. See console for details.',
      issues: result.error.issues,
    };
  }
  return { ok: true, payload: result.data };
}

export function applyBackup(payload: BackupPayload): void {
  useUseCaseStore.getState().replaceAll(payload.useCases);
  usePhaseStore.getState().replaceAll(payload.phases);
  useRiskStore.getState().replaceAll(payload.risks);
  useStakeholderStore.getState().replaceAll(payload.stakeholders);
  useDataObjectStore.getState().replaceAll(payload.dataObjects);
  useRaciStore.getState().replaceAll(payload.raciAssignments);
  usePillarStore.getState().replaceAll(payload.pillars);
  useSettingsStore.getState().replace(payload.settings);
}
