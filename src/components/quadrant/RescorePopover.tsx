import { useEffect, useMemo, useState } from 'react';
import { Check, RotateCcw, X } from 'lucide-react';
import {
  computeBusinessImpactScore,
  computeItDataImpactScore,
  deriveQuadrant,
} from '@/lib/scoring';
import { suggestSubScores } from '@/lib/rescoreSuggest';
import QuadrantBadge from '@/components/common/QuadrantBadge';
import SubScoreSlider from '@/components/useCase/SubScoreSlider';
import type { UseCase } from '@/types/useCase';
import { useSettingsStore } from '@/stores/settingsStore';
import { useUseCaseStore } from '@/stores/useCaseStore';
import { useFocusTrap } from '@/hooks/useFocusTrap';

type BusinessScores = Omit<UseCase['businessImpact'], 'score' | 'notes'>;
type ItDataScores = Omit<UseCase['itDataImpact'], 'score' | 'notes'>;

export default function RescorePopover({
  uc,
  targetBusiness,
  targetItData,
  onClose,
}: {
  uc: UseCase;
  targetBusiness: number;
  targetItData: number;
  onClose: () => void;
}) {
  const weights = useSettingsStore((s) => s.scoringWeights);
  const bcg = useSettingsStore((s) => s.bcgLabels);
  const updateScores = useUseCaseStore((s) => s.updateScores);

  const initialBi = useMemo<BusinessScores>(() => {
    const current: BusinessScores = {
      benefitSize: uc.businessImpact.benefitSize,
      urgency: uc.businessImpact.urgency,
      stakeholderBreadth: uc.businessImpact.stakeholderBreadth,
      timeToValue: uc.businessImpact.timeToValue,
      enablementPotential: uc.businessImpact.enablementPotential,
    };
    return suggestSubScores(current, targetBusiness, weights.business).subScores as BusinessScores;
  }, [uc.id, targetBusiness, weights]);

  const initialIt = useMemo<ItDataScores>(() => {
    const current: ItDataScores = {
      dataAvailability: uc.itDataImpact.dataAvailability,
      dataQuality: uc.itDataImpact.dataQuality,
      integrationComplexity: uc.itDataImpact.integrationComplexity,
      architecturalChange: uc.itDataImpact.architecturalChange,
    };
    return suggestSubScores(current, targetItData, weights.itData).subScores as ItDataScores;
  }, [uc.id, targetItData, weights]);

  const [bi, setBi] = useState(initialBi);
  const [it, setIt] = useState(initialIt);
  const ref = useFocusTrap<HTMLDivElement>({ active: true, onEscape: onClose });

  useEffect(() => {
    setBi(initialBi);
    setIt(initialIt);
  }, [initialBi, initialIt]);

  const biMean = computeBusinessImpactScore(bi, weights);
  const itMean = computeItDataImpactScore(it, weights);
  const quadrant = deriveQuadrant(biMean, itMean);

  const onCommit = () => {
    updateScores(uc.id, { businessImpact: bi, itDataImpact: it });
    onClose();
  };
  const onResetSuggest = () => {
    setBi(initialBi);
    setIt(initialIt);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        ref={ref}
        className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Rescore {uc.code}: {uc.title}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Target: Business {targetBusiness.toFixed(1)}, IT / Data {targetItData.toFixed(1)}.
              Sliders are pre-filled with a suggestion; tweak to taste.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 overflow-y-auto px-6 py-4 md:grid-cols-2">
          <section>
            <div className="mb-2 flex items-baseline justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Business impact</h3>
              <span className="text-xl font-semibold tabular-nums text-gmp-purple">
                {biMean.toFixed(1)}
              </span>
            </div>
            <div className="space-y-2">
              {(
                [
                  ['benefitSize', 'Benefit size'],
                  ['urgency', 'Urgency'],
                  ['stakeholderBreadth', 'Stakeholder breadth'],
                  ['timeToValue', 'Time to value'],
                  ['enablementPotential', 'Enablement potential'],
                ] as const
              ).map(([k, label]) => (
                <SubScoreSlider
                  key={k}
                  label={label}
                  description=""
                  value={bi[k]}
                  onChange={(v) => setBi((prev) => ({ ...prev, [k]: v as 1 | 2 | 3 | 4 | 5 }))}
                />
              ))}
            </div>
          </section>

          <section>
            <div className="mb-2 flex items-baseline justify-between">
              <h3 className="text-sm font-semibold text-slate-900">IT / Data difficulty</h3>
              <span className="text-xl font-semibold tabular-nums text-gmp-orange">
                {itMean.toFixed(1)}
              </span>
            </div>
            <div className="space-y-2">
              {(
                [
                  ['dataAvailability', 'Data availability difficulty'],
                  ['dataQuality', 'Data quality difficulty'],
                  ['integrationComplexity', 'Integration complexity'],
                  ['architecturalChange', 'Architectural change'],
                ] as const
              ).map(([k, label]) => (
                <SubScoreSlider
                  key={k}
                  label={label}
                  description=""
                  value={it[k]}
                  onChange={(v) => setIt((prev) => ({ ...prev, [k]: v as 1 | 2 | 3 | 4 | 5 }))}
                />
              ))}
            </div>
          </section>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-6 py-3">
          <div className="flex items-center gap-3 text-sm text-slate-600">
            Projected quadrant:
            <QuadrantBadge quadrant={quadrant} bcg={bcg} />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onResetSuggest}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
            >
              <RotateCcw size={13} aria-hidden="true" />
              Reset to suggestion
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onCommit}
              className="inline-flex items-center gap-1.5 rounded-md bg-gmp-purple px-4 py-1.5 text-sm font-medium text-white hover:bg-gmp-purple-700"
            >
              <Check size={14} aria-hidden="true" />
              Commit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
