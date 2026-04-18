import { z } from 'zod';
import { RaciLetterEnum } from './stakeholder';

export const RaciAssignmentSchema = z.object({
  id: z.string().uuid(),
  stakeholderId: z.string().uuid(),
  dataObjectId: z.string().uuid(),
  designation: RaciLetterEnum,
});
export type RaciAssignment = z.infer<typeof RaciAssignmentSchema>;
