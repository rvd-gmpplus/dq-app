import { useState } from 'react';
import { AlertTriangle, RotateCcw, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/stores/settingsStore';
import { useStakeholderStore } from '@/stores/stakeholderStore';
import { useUseCaseStore } from '@/stores/useCaseStore';
import { usePhaseStore } from '@/stores/phaseStore';
import { useRiskStore } from '@/stores/riskStore';
import { useDataObjectStore } from '@/stores/dataObjectStore';
import { useRaciStore } from '@/stores/raciStore';
import { usePillarStore } from '@/stores/pillarStore';
import { DEFAULT_SCORING_WEIGHTS, type ScoringWeights } from '@/types/settings';

const BUSINESS_LABELS: Record<keyof ScoringWeights['business'], string> = {
  benefitSize: 'Benefit size',
  urgency: 'Urgency',
  stakeholderBreadth: 'Stakeholder breadth',
  timeToValue: 'Time to value',
  enablementPotential: 'Enablement potential',
};
const IT_LABELS: Record<keyof ScoringWeights['itData'], string> = {
  dataAvailability: 'Data availability',
  dataQuality: 'Data quality',
  integrationComplexity: 'Integration complexity',
  architecturalChange: 'Architectural change',
};

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5">
      <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

export default function SettingsPage() {
  const s = useSettingsStore();
  const stakeholders = useStakeholderStore((st) =>
    [...Object.values(st.items)].sort((a, b) => a.name.localeCompare(b.name)),
  );

  const useCases = useUseCaseStore();
  const phases = usePhaseStore();
  const risks = useRiskStore();
  const dataObjects = useDataObjectStore();
  const raci = useRaciStore();
  const pillars = usePillarStore();

  const [weights, setWeights] = useState<ScoringWeights>(s.scoringWeights);
  const dirty = JSON.stringify(weights) !== JSON.stringify(s.scoringWeights);

  const [confirmReset, setConfirmReset] = useState('');
  const canReset = confirmReset === 'RESET';

  const onResetAll = () => {
    if (!canReset) return;
    useCases.reset();
    phases.reset();
    risks.reset();
    dataObjects.reset();
    raci.reset();
    pillars.reset();
    s.reset();
    localStorage.removeItem('dq:first-run-complete');
    setConfirmReset('');
    // Force a full reload so the first-run hook reseeds from the bundled seed modules.
    window.location.reload();
  };

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-xl font-semibold text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-600">
          Current user, scoring weights, theme, and the danger zone.
        </p>
      </header>

      <SectionCard
        title="Identity"
        description="Attribution on history entries and comments comes from this name."
      >
        <label className="block text-sm">
          <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
            Current user
          </span>
          <select
            value={s.currentUserStakeholderId ?? ''}
            onChange={(e) => {
              const found = stakeholders.find((x) => x.id === e.target.value);
              if (found) s.setCurrentUser(found.name, found.id);
              else s.setCurrentUser(s.currentUser);
            }}
            className="w-full max-w-md rounded-md border border-slate-200 bg-white px-2 py-2 text-sm focus:border-gmp-purple focus:outline-none"
          >
            <option value="">(free text below)</option>
            {stakeholders.map((x) => (
              <option key={x.id} value={x.id}>
                {x.name} — {x.role}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
            Name override
          </span>
          <input
            type="text"
            value={s.currentUser}
            onChange={(e) => s.setCurrentUser(e.target.value, s.currentUserStakeholderId)}
            className="w-full max-w-md rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm focus:border-gmp-purple focus:outline-none"
          />
        </label>
      </SectionCard>

      <SectionCard
        title="Project"
        description="Budget and fiscal information shown on the dashboard."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Fiscal year
            </span>
            <input
              type="number"
              value={s.fiscalYear}
              onChange={(e) => s.setFiscalYear(parseInt(e.target.value, 10) || 2026)}
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm focus:border-gmp-purple focus:outline-none"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Project start
            </span>
            <input
              type="date"
              value={s.projectStartDate.slice(0, 10)}
              onChange={(e) => s.setProjectStartDate(e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm focus:border-gmp-purple focus:outline-none"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Budget (EUR)
            </span>
            <input
              type="number"
              value={s.projectBudget}
              onChange={(e) => s.setBudget({ projectBudget: parseInt(e.target.value, 10) || 0 })}
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm focus:border-gmp-purple focus:outline-none"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Spent (EUR)
            </span>
            <input
              type="number"
              value={s.projectBudgetSpent}
              onChange={(e) => s.setBudget({ projectBudgetSpent: parseInt(e.target.value, 10) || 0 })}
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm focus:border-gmp-purple focus:outline-none"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Tolerance (±EUR)
            </span>
            <input
              type="number"
              value={s.budgetTolerance}
              onChange={(e) => s.setBudget({ budgetTolerance: parseInt(e.target.value, 10) || 0 })}
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm focus:border-gmp-purple focus:outline-none"
            />
          </label>
        </div>
      </SectionCard>

      <SectionCard
        title="Scoring weights"
        description="Higher weights pull the aggregate score towards the named sub-score. Defaults give equal weight (arithmetic mean)."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gmp-purple">
              Business impact
            </h3>
            <div className="mt-3 space-y-2">
              {(Object.keys(BUSINESS_LABELS) as (keyof ScoringWeights['business'])[]).map((k) => (
                <label key={k} className="flex items-center gap-3 text-sm">
                  <span className="w-40 text-slate-700">{BUSINESS_LABELS[k]}</span>
                  <input
                    type="number"
                    min={0}
                    step={0.1}
                    value={weights.business[k]}
                    onChange={(e) =>
                      setWeights({
                        ...weights,
                        business: {
                          ...weights.business,
                          [k]: parseFloat(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-24 rounded-md border border-slate-200 bg-white px-2 py-1 text-right text-sm focus:border-gmp-purple focus:outline-none"
                  />
                </label>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gmp-orange">
              IT / Data difficulty
            </h3>
            <div className="mt-3 space-y-2">
              {(Object.keys(IT_LABELS) as (keyof ScoringWeights['itData'])[]).map((k) => (
                <label key={k} className="flex items-center gap-3 text-sm">
                  <span className="w-40 text-slate-700">{IT_LABELS[k]}</span>
                  <input
                    type="number"
                    min={0}
                    step={0.1}
                    value={weights.itData[k]}
                    onChange={(e) =>
                      setWeights({
                        ...weights,
                        itData: {
                          ...weights.itData,
                          [k]: parseFloat(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-24 rounded-md border border-slate-200 bg-white px-2 py-1 text-right text-sm focus:border-gmp-purple focus:outline-none"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setWeights(DEFAULT_SCORING_WEIGHTS)}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            <RotateCcw size={13} aria-hidden="true" />
            Reset to equal weights
          </button>
          <button
            type="button"
            disabled={!dirty}
            onClick={() => s.setWeights(weights)}
            className="inline-flex items-center gap-1.5 rounded-md bg-gmp-purple px-3 py-1.5 text-sm font-medium text-white hover:bg-gmp-purple-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            <Save size={13} aria-hidden="true" />
            Apply weights to every use case
          </button>
        </div>
        {dirty && (
          <p className="mt-2 text-[11px] italic text-amber-700">
            Applying new weights re-derives every aggregate score and quadrant on next mutation.
          </p>
        )}
      </SectionCard>

      <SectionCard title="Appearance">
        <div className="flex flex-wrap gap-6">
          <fieldset>
            <legend className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Theme
            </legend>
            <div className="mt-2 flex gap-2">
              {(['light', 'dark'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => s.setTheme(t)}
                  className={cn(
                    'rounded-md border px-3 py-1.5 text-sm capitalize',
                    s.theme === t
                      ? 'border-gmp-purple bg-gmp-purple text-white'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </fieldset>
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-gmp-purple focus:ring-gmp-purple"
              checked={s.colourBlindMode}
              onChange={(e) => s.setColourBlindMode(e.target.checked)}
            />
            Colour-blind patterns on quadrant bubbles
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-gmp-purple focus:ring-gmp-purple"
              checked={s.bcgLabels}
              onChange={(e) => s.setBcgLabels(e.target.checked)}
            />
            BCG labels (Stars / Cash Cows / Dogs / Question Marks)
          </label>
        </div>
      </SectionCard>

      <section className="rounded-lg border border-rose-200 bg-rose-50 p-5">
        <h2 className="inline-flex items-center gap-2 text-sm font-semibold text-rose-700">
          <AlertTriangle size={14} aria-hidden="true" />
          Danger zone
        </h2>
        <p className="mt-1 text-xs text-rose-700">
          Reset wipes every store back to the bundled seed data. Type RESET below to confirm.
        </p>
        <div className="mt-3 flex items-center gap-2">
          <input
            type="text"
            placeholder="Type RESET to confirm"
            value={confirmReset}
            onChange={(e) => setConfirmReset(e.target.value)}
            className="rounded-md border border-rose-200 bg-white px-3 py-1.5 text-sm placeholder:text-rose-400 focus:border-rose-500 focus:outline-none"
          />
          <button
            type="button"
            disabled={!canReset}
            onClick={onResetAll}
            className="inline-flex items-center gap-1.5 rounded-md bg-rose-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-300"
          >
            Reset all data
          </button>
        </div>
      </section>
    </div>
  );
}
