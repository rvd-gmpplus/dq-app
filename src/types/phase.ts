import { z } from 'zod';

export const PhaseStatusEnum = z.enum(['Completed', 'In Progress', 'Delayed', 'Not Started']);
export type PhaseStatus = z.infer<typeof PhaseStatusEnum>;

export const PhaseNameEnum = z.enum([
  'Preparation',
  'Deep Dive',
  'Keep Core Clean',
  'Data Entry',
  'Data Cleaning',
]);
export type PhaseName = z.infer<typeof PhaseNameEnum>;

export const DeliverableSchema = z.object({
  name: z.string(),
  done: z.boolean(),
  notes: z.string().optional(),
});
export type Deliverable = z.infer<typeof DeliverableSchema>;

export const PhaseSchema = z.object({
  id: z.number().int().min(1).max(5),
  name: PhaseNameEnum,
  status: PhaseStatusEnum,
  plannedStart: z.string(),
  plannedEnd: z.string(),
  actualStart: z.string().optional(),
  actualEnd: z.string().optional(),
  deliverables: z.array(DeliverableSchema),
  blockers: z.array(z.string()),
});
export type Phase = z.infer<typeof PhaseSchema>;
