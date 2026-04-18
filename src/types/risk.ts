import { z } from 'zod';

export const RiskStatusEnum = z.enum(['Open', 'Monitoring', 'Mitigated', 'Closed']);
export type RiskStatus = z.infer<typeof RiskStatusEnum>;

export const RiskSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  likelihood: z.number().int().min(1).max(5),
  impact: z.number().int().min(1).max(5),
  score: z.number().int().min(1).max(25),
  mitigation: z.string(),
  owner: z.string(),
  status: RiskStatusEnum,
});
export type Risk = z.infer<typeof RiskSchema>;
