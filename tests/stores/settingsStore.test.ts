import { beforeEach, describe, expect, it } from 'vitest';
import { useSettingsStore } from '@/stores/settingsStore';
import { DEFAULT_SCORING_WEIGHTS } from '@/types/settings';

beforeEach(() => {
  localStorage.clear();
  useSettingsStore.getState().reset();
});

describe('settingsStore', () => {
  it('starts from the default settings', () => {
    const state = useSettingsStore.getState();
    expect(state.orgName).toBe('GMP+ International');
    expect(state.currentUser).toBe('Mirella van der Kleij');
    expect(state.scoringWeights).toEqual(DEFAULT_SCORING_WEIGHTS);
  });

  it('setWeights persists updated weights', () => {
    useSettingsStore.getState().setWeights({
      ...DEFAULT_SCORING_WEIGHTS,
      business: { ...DEFAULT_SCORING_WEIGHTS.business, benefitSize: 3 },
    });
    expect(useSettingsStore.getState().scoringWeights.business.benefitSize).toBe(3);
  });

  it('setCurrentUser remembers the stakeholder id when provided', () => {
    const uuid = '11111111-1111-4111-8111-111111111111';
    useSettingsStore.getState().setCurrentUser('Stan Hendriks', uuid);
    expect(useSettingsStore.getState().currentUser).toBe('Stan Hendriks');
    expect(useSettingsStore.getState().currentUserStakeholderId).toBe(uuid);
  });

  it('dismissOnboarding sets the flag', () => {
    useSettingsStore.getState().dismissOnboarding();
    expect(useSettingsStore.getState().onboardingDismissed).toBe(true);
  });

  it('reset restores defaults', () => {
    useSettingsStore.getState().setTheme('dark');
    useSettingsStore.getState().reset();
    expect(useSettingsStore.getState().theme).toBe('light');
  });
});
