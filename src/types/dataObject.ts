import { z } from 'zod';

export const SystemEnum = z.enum(['D365 CE', 'Resco', 'Portal', 'Platform', 'Exact', 'Other']);
export type System = z.infer<typeof SystemEnum>;

export const SensitivityEnum = z.enum(['Low', 'Medium', 'High']);
export type Sensitivity = z.infer<typeof SensitivityEnum>;

export const DataObjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  owner: z.string(),
  system: SystemEnum,
  sensitivity: SensitivityEnum,
  relatedUseCases: z.array(z.string().uuid()),
});
export type DataObject = z.infer<typeof DataObjectSchema>;
