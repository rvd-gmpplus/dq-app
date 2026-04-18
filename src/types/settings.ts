import { z } from 'zod';

export const BusinessWeightsSchema = z.object({
  benefitSize: z.number().min(0),
  urgency: z.number().min(0),
  stakeholderBreadth: z.number().min(0),
  timeToValue: z.number().min(0),
  enablementPotential: z.number().min(0),
});
export type BusinessWeights = z.infer<typeof BusinessWeightsSchema>;

export const ItDataWeightsSchema = z.object({
  dataAvailability: z.number().min(0),
  dataQuality: z.number().min(0),
  integrationComplexity: z.number().min(0),
  architecturalChange: z.number().min(0),
});
export type ItDataWeights = z.infer<typeof ItDataWeightsSchema>;

export const ScoringWeightsSchema = z.object({
  business: BusinessWeightsSchema,
  itData: ItDataWeightsSchema,
});
export type ScoringWeights = z.infer<typeof ScoringWeightsSchema>;

export const ThemeEnum = z.enum(['light', 'dark']);
export type Theme = z.infer<typeof ThemeEnum>;

export const SettingsSchema = z.object({
  orgName: z.literal('GMP+ International'),
  fiscalYear: z.number().int(),
  projectBudget: z.number().nonnegative(),
  projectBudgetSpent: z.number().nonnegative(),
  budgetTolerance: z.number().nonnegative(),
  projectStartDate: z.string(),
  currentUser: z.string(),
  currentUserStakeholderId: z.string().uuid().optional(),
  theme: ThemeEnum,
  colourBlindMode: z.boolean(),
  bcgLabels: z.boolean(),
  scoringWeights: ScoringWeightsSchema,
  onboardingDismissed: z.boolean(),
  schemaVersion: z.number().int(),
});
export type Settings = z.infer<typeof SettingsSchema>;

export const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  business: {
    benefitSize: 1,
    urgency: 1,
    stakeholderBreadth: 1,
    timeToValue: 1,
    enablementPotential: 1,
  },
  itData: {
    dataAvailability: 1,
    dataQuality: 1,
    integrationComplexity: 1,
    architecturalChange: 1,
  },
};

export const DEFAULT_SETTINGS: Settings = {
  orgName: 'GMP+ International',
  fiscalYear: 2026,
  projectBudget: 325000,
  projectBudgetSpent: 0,
  budgetTolerance: 30000,
  projectStartDate: '2025-10-01',
  currentUser: 'Mirella van der Kleij',
  theme: 'light',
  colourBlindMode: false,
  bcgLabels: false,
  scoringWeights: DEFAULT_SCORING_WEIGHTS,
  onboardingDismissed: false,
  schemaVersion: 1,
};
