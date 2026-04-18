import { z } from 'zod';
import { PillarEnum } from './useCase';

export const OgsmTargetSchema = z.object({
  label: z.string(),
  targetValue: z.string(),
  year: z.number().int(),
});
export type OgsmTarget = z.infer<typeof OgsmTargetSchema>;

export const PillarMetadataSchema = z.object({
  pillar: PillarEnum,
  priority: z.number().int().min(1).max(3),
  displayName: z.string(),
  ambition: z.string(),
  ogsmTargets: z.array(OgsmTargetSchema),
  legacyMapping: z.string(),
  keyDataObjectIds: z.array(z.string()),
});
export type PillarMetadata = z.infer<typeof PillarMetadataSchema>;
