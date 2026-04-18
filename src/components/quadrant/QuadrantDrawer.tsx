import { Link } from 'react-router-dom';
import { ExternalLink, X } from 'lucide-react';
import PillarBadge from '@/components/common/PillarBadge';
import QuadrantBadge from '@/components/common/QuadrantBadge';
import StatusBadge from '@/components/common/StatusBadge';
import type { UseCase } from '@/types/useCase';
import { useSettingsStore } from '@/stores/settingsStore';

export default function QuadrantDrawer({
  uc,
  onClose,
}: {
  uc: UseCase | null;
  onClose: () => void;
}) {
  const bcg = useSettingsStore((s) => s.bcgLabels);
  if (!uc) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex justify-end bg-slate-900/20"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-slate-500">{uc.code}</span>
            <span className="text-sm font-semibold text-slate-900">{uc.title}</span>
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
        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={uc.status} />
            <QuadrantBadge quadrant={uc.quadrant} bcg={bcg} />
            {uc.pillars.map((p) => (
              <PillarBadge key={p} pillar={p} />
            ))}
          </div>
          <dl className="grid grid-cols-2 gap-3 rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-xs">
            <div>
              <dt className="text-slate-500">Business</dt>
              <dd className="text-xl font-semibold tabular-nums text-gmp-purple">
                {uc.businessImpact.score.toFixed(1)}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">IT / Data difficulty</dt>
              <dd className="text-xl font-semibold tabular-nums text-gmp-orange">
                {uc.itDataImpact.score.toFixed(1)}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Owner</dt>
              <dd className="text-slate-800">{uc.owner}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Data objects</dt>
              <dd className="text-slate-800">{uc.relatedDataObjects.length}</dd>
            </div>
          </dl>
          {uc.problem && (
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Problem
              </div>
              <p className="mt-1 text-sm text-slate-700">{uc.problem}</p>
            </div>
          )}
          {uc.objective && (
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Objective
              </div>
              <p className="mt-1 text-sm text-slate-700">{uc.objective}</p>
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-6 py-3">
          <Link
            to={`/use-cases/${uc.id}`}
            className="inline-flex items-center gap-1.5 rounded-md bg-gmp-purple px-3 py-1.5 text-sm font-medium text-white hover:bg-gmp-purple-700"
          >
            Open full detail
            <ExternalLink size={13} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}
