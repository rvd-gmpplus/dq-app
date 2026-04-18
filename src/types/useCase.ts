import { z } from 'zod';

export const PillarEnum = z.enum(['Transparency', 'Insight', 'Market']);
export type Pillar = z.infer<typeof PillarEnum>;

export const StatusEnum = z.enum([
  'Idea',
  'Backlog',
  'In Progress',
  'Completed',
  'Parked',
  'Rejected',
]);
export type UseCaseStatus = z.infer<typeof StatusEnum>;

export const QuadrantEnum = z.enum(['QuickWin', 'Strategic', 'Filler', 'DontPursue']);
export type Quadrant = z.infer<typeof QuadrantEnum>;

const SubScore = z.number().int().min(1).max(5);
const AggregateScore = z.number().min(0).max(5);

export const BusinessImpactSchema = z.object({
  score: AggregateScore,
  benefitSize: SubScore,
  urgency: SubScore,
  stakeholderBreadth: SubScore,
  timeToValue: SubScore,
  enablementPotential: SubScore,
  notes: z.string().optional(),
});
export type BusinessImpact = z.infer<typeof BusinessImpactSchema>;

export const ItDataImpactSchema = z.object({
  score: AggregateScore,
  dataAvailability: SubScore,
  dataQuality: SubScore,
  integrationComplexity: SubScore,
  architecturalChange: SubScore,
  notes: z.string().optional(),
});
export type ItDataImpact = z.infer<typeof ItDataImpactSchema>;

export const FieldDiffSchema = z.object({
  field: z.string(),
  before: z.unknown(),
  after: z.unknown(),
});
export type FieldDiff = z.infer<typeof FieldDiffSchema>;

export const HistoryEntrySchema = z.object({
  at: z.string().datetime(),
  by: z.string(),
  action: z.string(),
  diffs: z.array(FieldDiffSchema).optional(),
});
export type HistoryEntry = z.infer<typeof HistoryEntrySchema>;

export const CommentSchema = z.object({
  id: z.string(),
  at: z.string().datetime(),
  by: z.string(),
  text: z.string().max(4000),
});
export type Comment = z.infer<typeof CommentSchema>;

export const AttachmentSchema = z.object({
  label: z.string(),
  url: z.string().url(),
});
export type Attachment = z.infer<typeof AttachmentSchema>;

export const UseCaseSchema = z.object({
  id: z.string().uuid(),
  code: z.string().regex(/^UC-\d{3,}$/),
  title: z.string().min(1).max(80),
  status: StatusEnum,
  pillars: z.array(PillarEnum).min(1).max(3),
  owner: z.string(),
  submittedBy: z.string(),

  businessImpact: BusinessImpactSchema,
  itDataImpact: ItDataImpactSchema,
  quadrant: QuadrantEnum,

  problem: z.string(),
  objective: z.string(),
  kpis: z.array(z.string()),
  solutionDescription: z.string(),
  scopeIn: z.array(z.string()),
  scopeOut: z.array(z.string()),

  relatedDataObjects: z.array(z.string()),
  relatedJiraKeys: z.array(z.string().regex(/^GMP-\d+$/)),
  relatedPhases: z.array(z.number().int().min(1).max(5)),
  linkedAttachments: z.array(AttachmentSchema),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  history: z.array(HistoryEntrySchema),
  comments: z.array(CommentSchema),
  tags: z.array(z.string()),
});
export type UseCase = z.infer<typeof UseCaseSchema>;
