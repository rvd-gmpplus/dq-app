import { useEffect, useState } from 'react';
import { Check, RotateCcw } from 'lucide-react';
import { useUseCaseStore } from '@/stores/useCaseStore';
import { useSettingsStore } from '@/stores/settingsStore';
import {
  computeBusinessImpactScore,
  computeItDataImpactScore,
  deriveQuadrant,
} from '@/lib/scoring';
import type { UseCase } from '@/types/useCase';
import SubScoreSlider from './SubScoreSlider';
import ImpactRadar from './ImpactRadar';
import QuadrantBadge from '@/components/common/QuadrantBadge';

const BUSINESS_DEFS = {
  benefitSize: {
    label: 'Benefit size',
    description: 'Scale of the upside the use case creates when delivered.',
    scaleHint: '1 = marginal, 5 = transformational',
  },
  urgency: {
    label: 'Urgency',
    description: 'How soon the business needs the outcome.',
    scaleHint: '1 = nice to have, 5 = this quarter',
  },
  stakeholderBreadth: {
    label: 'Stakeholder breadth',
    description: 'How many teams or partners benefit.',
    scaleHint: '1 = single team, 5 = whole scheme',
  },
  timeToValue: {
    label: 'Time to value',
    description: 'How quickly the benefit is realised after go-live.',
    scaleHint: '1 = slow to land, 5 = immediate payoff',
  },
  enablementPotential: {
    label: 'Enablement potential',
    description: 'Whether this unlocks further use cases downstream.',
    scaleHint: '1 = local only, 5 = platform enabler',
  },
} as const;

const IT_DEFS = {
  dataAvailability: {
    label: 'Data availability difficulty',
    description: 'How hard it is to obtain the data needed.',
    scaleHint: '1 = already at hand, 5 = not available yet',
  },
  dataQuality: {
    label: 'Data quality difficulty',
    description: 'How dirty the source data is.',
    scaleHint: '1 = clean, 5 = severely polluted',
  },
  integrationComplexity: {
    label: 'Integration complexity',
    description: 'Systems and interfaces the solution must touch.',
    scaleHint: '1 = one system, 5 = several systems and partners',
  },
  architecturalChange: {
    label: 'Architectural change',
    description: 'Degree of architectural shift required.',
    scaleHint: '1 = tweak, 5 = platform rework',
  },
} as const;

export default function ScoringTab({ uc }: { uc: UseCase }) {
  const updateScores = useUseCaseStore((s) => s.updateScores);
  const weights = useSettingsStore((s) => s.scoringWeights);
  const bcg = useSettingsStore((s) => s.bcgLabels);

  const [bi, setBi] = useState(() => ({
    benefitSize: uc.businessImpact.benefitSize,
    urgency: uc.businessImpact.urgency,
    stakeholderBreadth: uc.businessImpact.stakeholderBreadth,
    timeToValue: uc.businessImpact.timeToValue,
    enablementPotential: uc.businessImpact.enablementPotential,
  }));
  const [it, setIt] = useState(() => ({
    dataAvailability: uc.itDataImpact.dataAvailability,
    dataQuality: uc.itDataImpact.dataQuality,
    integrationComplexity: uc.itDataImpact.integrationComplexity,
    architecturalChange: uc.itDataImpact.architecturalChange,
  }));

  useEffect(() => {
    setBi({
      benefitSize: uc.businessImpact.benefitSize,
      urgency: uc.businessImpact.urgency,
      stakeholderBreadth: uc.businessImpact.stakeholderBreadth,
      timeToValue: uc.businessImpact.timeToValue,
      enablementPotential: uc.businessImpact.enablementPotential,
    });
    setIt({
      dataAvailability: uc.itDataImpact.dataAvailability,
      dataQuality: uc.itDataImpact.dataQuality,
      integrationComplexity: uc.itDataImpact.integrationComplexity,
      architecturalChange: uc.itDataImpact.architecturalChange,
    });
  }, [uc.id]);

  const biScore = computeBusinessImpactScore(bi, weights);
  const itScore = computeItDataImpactScore(it, weights);
  const quadrant = deriveQuadrant(biScore, itScore);

  const dirty =
    biScore !== uc.businessImpact.score ||
    itScore !== uc.itDataImpact.score ||
    (Object.keys(bi) as (keyof typeof bi)[]).some((k) => bi[k] !== uc.businessImpact[k]) ||
    (Object.keys(it) as (keyof typeof it)[]).some((k) => it[k] !== uc.itDataImpact[k]);

  const onCommit = () => {
    updateScores(uc.id, { businessImpact: bi, itDataImpact: it });
  };

  const onReset = () => {
    setBi({
      benefitSize: uc.businessImpact.benefitSize,
      urgency: uc.businessImpact.urgency,
      stakeholderBreadth: uc.businessImpact.stakeholderBreadth,
      timeToValue: uc.businessImpact.timeToValue,
      enablementPotential: uc.businessImpact.enablementPotential,
    });
    setIt({
      dataAvailability: uc.itDataImpact.dataAvailability,
      dataQuality: uc.itDataImpact.dataQuality,
      integrationComplexity: uc.itDataImpact.integrationComplexity,
      architecturalChange: uc.itDataImpact.architecturalChange,
    });
  };

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <div className="space-y-5 lg:col-span-2">
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex items-baseline justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Business impact</h3>
            <span className="text-2xl font-semibold tabular-nums text-gmp-purple">
              {biScore.toFixed(1)}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Weighted mean of benefit, urgency, breadth, time-to-value, and enablement. 1 = minimal,
            5 = maximal.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {(Object.keys(BUSINESS_DEFS) as (keyof typeof BUSINESS_DEFS)[]).map((k) => (
              <SubScoreSlider
                key={k}
                label={BUSINESS_DEFS[k].label}
                description={BUSINESS_DEFS[k].description}
                scaleHint={BUSINESS_DEFS[k].scaleHint}
                value={bi[k]}
                onChange={(v) =>
                  setBi((prev) => ({ ...prev, [k]: v as 1 | 2 | 3 | 4 | 5 }))
                }
              />
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex items-baseline justify-between">
            <h3 className="text-sm font-semibold text-slate-900">IT / Data difficulty</h3>
            <span className="text-2xl font-semibold tabular-nums text-gmp-orange">
              {itScore.toFixed(1)}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Weighted mean of data availability, data quality, integration, and architectural change.
            1 = easy, 5 = hard.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {(Object.keys(IT_DEFS) as (keyof typeof IT_DEFS)[]).map((k) => (
              <SubScoreSlider
                key={k}
                label={IT_DEFS[k].label}
                description={IT_DEFS[k].description}
                scaleHint={IT_DEFS[k].scaleHint}
                value={it[k]}
                onChange={(v) =>
                  setIt((prev) => ({ ...prev, [k]: v as 1 | 2 | 3 | 4 | 5 }))
                }
              />
            ))}
          </div>
        </section>
      </div>

      <aside className="space-y-5">
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-slate-900">Impact profile</h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Business axes in purple, IT / Data axes in orange.
          </p>
          <div className="mt-3">
            <ImpactRadar
              businessData={(Object.keys(BUSINESS_DEFS) as (keyof typeof BUSINESS_DEFS)[]).map(
                (k) => ({ axis: BUSINESS_DEFS[k].label, value: bi[k] }),
              )}
              itDataData={(Object.keys(IT_DEFS) as (keyof typeof IT_DEFS)[]).map((k) => ({
                axis: IT_DEFS[k].label,
                value: it[k],
              }))}
            />
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-slate-900">Projected quadrant</h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Where this use case will land on the quadrant when scores are committed.
          </p>
          <div className="mt-3">
            <QuadrantBadge quadrant={quadrant} bcg={bcg} className="text-sm" />
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={onCommit}
              disabled={!dirty}
              className="inline-flex items-center justify-center gap-1.5 rounded-md bg-gmp-purple px-4 py-2 text-sm font-medium text-white hover:bg-gmp-purple-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              <Check size={14} aria-hidden="true" />
              Commit scoring
            </button>
            <button
              type="button"
              onClick={onReset}
              disabled={!dirty}
              className="inline-flex items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RotateCcw size={14} aria-hidden="true" />
              Discard changes
            </button>
          </div>
          {dirty && (
            <p className="mt-2 text-[11px] italic text-amber-700">Unsaved sub-score changes.</p>
          )}
        </section>
      </aside>
    </div>
  );
}
