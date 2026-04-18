import { create } from 'zustand';
import { createPersistedSlice } from '@/lib/persistence';
import {
  DEFAULT_SCORING_WEIGHTS,
  DEFAULT_SETTINGS,
  SettingsSchema,
  type ScoringWeights,
  type Settings,
  type Theme,
} from '@/types/settings';

const slice = createPersistedSlice<Settings>({
  key: 'dq:settings',
  initial: DEFAULT_SETTINGS,
  schema: SettingsSchema,
  currentVersion: 1,
});

type State = Settings;

type Actions = {
  reset: () => void;
  setCurrentUser: (name: string, stakeholderId?: string) => void;
  setWeights: (weights: ScoringWeights) => void;
  resetWeights: () => void;
  setTheme: (theme: Theme) => void;
  setColourBlindMode: (v: boolean) => void;
  setBcgLabels: (v: boolean) => void;
  setBudget: (patch: Partial<Pick<Settings, 'projectBudget' | 'projectBudgetSpent' | 'budgetTolerance'>>) => void;
  setFiscalYear: (year: number) => void;
  setProjectStartDate: (iso: string) => void;
  dismissOnboarding: () => void;
  replace: (next: Settings) => void;
};

export const useSettingsStore = create<State & Actions>((set, get) => {
  slice.subscribe((s) => set(s));

  const commit = (mutator: (s: State) => State) => {
    const next = mutator(get());
    slice.write(next);
    set(next);
  };

  return {
    ...slice.read(),

    reset: () => commit(() => ({ ...DEFAULT_SETTINGS })),
    setCurrentUser: (name, stakeholderId) =>
      commit((s) => ({ ...s, currentUser: name, currentUserStakeholderId: stakeholderId })),
    setWeights: (weights) => commit((s) => ({ ...s, scoringWeights: weights })),
    resetWeights: () => commit((s) => ({ ...s, scoringWeights: DEFAULT_SCORING_WEIGHTS })),
    setTheme: (theme) => commit((s) => ({ ...s, theme })),
    setColourBlindMode: (v) => commit((s) => ({ ...s, colourBlindMode: v })),
    setBcgLabels: (v) => commit((s) => ({ ...s, bcgLabels: v })),
    setBudget: (patch) => commit((s) => ({ ...s, ...patch })),
    setFiscalYear: (year) => commit((s) => ({ ...s, fiscalYear: year })),
    setProjectStartDate: (iso) => commit((s) => ({ ...s, projectStartDate: iso })),
    dismissOnboarding: () => commit((s) => ({ ...s, onboardingDismissed: true })),
    replace: (next) => commit(() => next),
  };
});
