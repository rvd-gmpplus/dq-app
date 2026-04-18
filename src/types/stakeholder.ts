import { z } from 'zod';
import { PillarEnum } from './useCase';

export const RaciLetterEnum = z.enum(['R', 'A', 'C', 'I']);
export type RaciLetter = z.infer<typeof RaciLetterEnum>;

export const StakeholderGroupEnum = z.enum(['Internal', 'SME', 'External', 'Sponsor']);
export type StakeholderGroup = z.infer<typeof StakeholderGroupEnum>;

export const StakeholderSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  role: z.string(),
  group: StakeholderGroupEnum,
  raci: RaciLetterEnum,
  pillar: PillarEnum.optional(),
  contact: z.string().optional(),
  notes: z.string().optional(),
});
export type Stakeholder = z.infer<typeof StakeholderSchema>;
