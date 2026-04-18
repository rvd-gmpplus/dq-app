import { z } from 'zod';
import { UseCaseSchema } from './useCase';
import { PhaseSchema } from './phase';
import { RiskSchema } from './risk';
import { StakeholderSchema } from './stakeholder';
import { DataObjectSchema } from './dataObject';
import { RaciAssignmentSchema } from './raciAssignment';
import { PillarMetadataSchema } from './pillarMetadata';
import { SettingsSchema } from './settings';

export const BACKUP_VERSION = 1;

export const BackupPayloadSchema = z.object({
  version: z.number().int(),
  exportedAt: z.string().datetime(),
  useCases: z.array(UseCaseSchema),
  phases: z.array(PhaseSchema),
  risks: z.array(RiskSchema),
  stakeholders: z.array(StakeholderSchema),
  dataObjects: z.array(DataObjectSchema),
  raciAssignments: z.array(RaciAssignmentSchema),
  pillars: z.array(PillarMetadataSchema),
  settings: SettingsSchema,
});
export type BackupPayload = z.infer<typeof BackupPayloadSchema>;
