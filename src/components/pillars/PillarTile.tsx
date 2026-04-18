import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Target, Pencil, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PillarMetadata } from '@/types/pillarMetadata';
import type { UseCase } from '@/types/useCase';
import { usePillarStore } from '@/stores/pillarStore';

const BORDER: Record<number, string> = {
  1: 'border-l-4 border-l-gmp-purple',
  2: 'border-l-4 border-l-gmp-green',
  3: 'border-l-4 border-l-gmp-orange',
};

const ACCENT: Record<number, string> = {
  1: 'bg-gmp-purple-50 text-gmp-purple-700',
  2: 'bg-gmp-green-50 text-gmp-green-700',
  3: 'bg-gmp-orange-50 text-orange-700',
};

export default function PillarTile({
  pillar,
  useCases,
}: {
  pillar: PillarMetadata;
  useCases: UseCase[];
}) {
  const setAmbition = usePillarStore((s) => s.setAmbition);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(pillar.ambition);

  const myUseCases = useCases.filter((u) => u.pillars.includes(pillar.pillar));
  const topThree = [...myUseCases]
    .sort((a, b) => b.businessImpact.score - a.businessImpact.score)
    .slice(0, 3);
  const totalBi = myUseCases.reduce((sum, u) => sum + u.businessImpact.score, 0);

  const onSaveAmbition = () => {
    setAmbition(pillar.pillar, draft.trim());
    setEditing(false);
  };

  return (
    <article className={cn('flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm', BORDER[pillar.priority])}>
      <header className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className={cn('rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide', ACCENT[pillar.priority])}>
              Priority {pillar.priority}
            </span>
            <h2 className="text-base font-semibold text-slate-900">{pillar.displayName}</h2>
          </div>
        </div>
        <Link
          to={`/use-cases?pillar=${pillar.pillar}`}
          className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-50"
        >
          See use cases
        </Link>
      </header>

      <section className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
        <div>
          <div className="text-[11px] uppercase tracking-wide text-slate-500">Use cases</div>
          <div className="text-2xl font-semibold tabular-nums text-slate-900">{myUseCases.length}</div>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-wide text-slate-500">Total business impact</div>
          <div className="text-2xl font-semibold tabular-nums text-gmp-purple">
            {totalBi.toFixed(1)}
          </div>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-wide text-slate-500">Key data objects</div>
          <div className="text-sm text-slate-700">{pillar.keyDataObjectIds.length}</div>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Ambition</h3>
          {!editing && (
            <button
              type="button"
              onClick={() => {
                setDraft(pillar.ambition);
                setEditing(true);
              }}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            >
              <Pencil size={11} />
              Edit
            </button>
          )}
        </div>
        {editing ? (
          <div className="mt-1">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={4}
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:border-gmp-purple focus:outline-none"
            />
            <div className="mt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-50"
              >
                <X size={12} />
                Cancel
              </button>
              <button
                type="button"
                onClick={onSaveAmbition}
                className="inline-flex items-center gap-1 rounded-md bg-gmp-purple px-2.5 py-1 text-xs font-medium text-white hover:bg-gmp-purple-700"
              >
                <Check size={12} />
                Save
              </button>
            </div>
          </div>
        ) : (
          <p className="mt-1 text-sm leading-relaxed text-slate-700">{pillar.ambition}</p>
        )}
      </section>

      {pillar.ogsmTargets.length > 0 && (
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">OGSM targets</h3>
          <ul className="mt-2 space-y-1 text-sm">
            {pillar.ogsmTargets.map((t) => (
              <li key={t.label} className="flex items-center gap-2 text-slate-700">
                <Target size={12} className="text-gmp-purple" aria-hidden="true" />
                <span className="font-medium">{t.label}:</span>
                <span>{t.targetValue}</span>
                <span className="text-slate-400">by {t.year}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {topThree.length > 0 && (
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Top use cases
          </h3>
          <ul className="mt-2 space-y-1 text-sm">
            {topThree.map((uc) => (
              <li key={uc.id}>
                <Link
                  to={`/use-cases/${uc.id}`}
                  className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-slate-50"
                >
                  <span className="font-mono text-[11px] text-slate-500">{uc.code}</span>
                  <span className="truncate text-slate-800">{uc.title}</span>
                  <span className="ml-auto text-[11px] tabular-nums text-gmp-purple">
                    {uc.businessImpact.score.toFixed(1)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
