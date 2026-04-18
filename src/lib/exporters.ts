import type { UseCase } from '@/types/useCase';
import { BACKUP_VERSION, type BackupPayload } from '@/types/backup';
import { useUseCaseStore } from '@/stores/useCaseStore';
import { usePhaseStore } from '@/stores/phaseStore';
import { useRiskStore } from '@/stores/riskStore';
import { useStakeholderStore } from '@/stores/stakeholderStore';
import { useDataObjectStore } from '@/stores/dataObjectStore';
import { useRaciStore } from '@/stores/raciStore';
import { usePillarStore } from '@/stores/pillarStore';
import { useSettingsStore } from '@/stores/settingsStore';

export function buildBackupPayload(): BackupPayload {
  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    useCases: Object.values(useUseCaseStore.getState().items),
    phases: usePhaseStore.getState().items,
    risks: Object.values(useRiskStore.getState().items),
    stakeholders: Object.values(useStakeholderStore.getState().items),
    dataObjects: Object.values(useDataObjectStore.getState().items),
    raciAssignments: Object.values(useRaciStore.getState().items),
    pillars: usePillarStore.getState().items,
    settings: (() => {
      const {
        orgName,
        fiscalYear,
        projectBudget,
        projectBudgetSpent,
        budgetTolerance,
        projectStartDate,
        currentUser,
        currentUserStakeholderId,
        theme,
        colourBlindMode,
        bcgLabels,
        scoringWeights,
        onboardingDismissed,
        schemaVersion,
      } = useSettingsStore.getState();
      return {
        orgName,
        fiscalYear,
        projectBudget,
        projectBudgetSpent,
        budgetTolerance,
        projectStartDate,
        currentUser,
        currentUserStakeholderId,
        theme,
        colourBlindMode,
        bcgLabels,
        scoringWeights,
        onboardingDismissed,
        schemaVersion,
      };
    })(),
  };
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function timestamp(): string {
  return new Date().toISOString().slice(0, 10);
}

export function exportBackupJson(payload: BackupPayload = buildBackupPayload()): void {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  triggerDownload(blob, `gmp-dq-backup-${timestamp()}.json`);
}

const CSV_HEADER = [
  'code',
  'title',
  'status',
  'pillars',
  'owner',
  'submittedBy',
  'businessImpact',
  'itDataImpact',
  'quadrant',
  'problem',
  'objective',
  'kpis',
  'tags',
  'relatedJiraKeys',
  'relatedDataObjects',
  'updatedAt',
];

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (/["\n\r,]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function useCasesToCsv(list: UseCase[]): string {
  const lines = [CSV_HEADER.join(',')];
  for (const uc of list) {
    lines.push(
      [
        uc.code,
        uc.title,
        uc.status,
        uc.pillars.join('|'),
        uc.owner,
        uc.submittedBy,
        uc.businessImpact.score.toFixed(1),
        uc.itDataImpact.score.toFixed(1),
        uc.quadrant,
        uc.problem,
        uc.objective,
        uc.kpis.join(' | '),
        uc.tags.join('|'),
        uc.relatedJiraKeys.join('|'),
        uc.relatedDataObjects.join('|'),
        uc.updatedAt,
      ]
        .map(csvEscape)
        .join(','),
    );
  }
  return lines.join('\r\n');
}

export function exportUseCasesCsv(list: UseCase[]): void {
  const csv = useCasesToCsv(list);
  // BOM prefix so Excel opens UTF-8 correctly with en-GB locales.
  const blob = new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8' });
  triggerDownload(blob, `gmp-dq-use-cases-${timestamp()}.csv`);
}
