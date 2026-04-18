import { useState } from 'react';
import { Info } from 'lucide-react';
import { usePillarStore } from '@/stores/pillarStore';
import { useUseCaseStore } from '@/stores/useCaseStore';
import PillarTile from '@/components/pillars/PillarTile';

export default function PillarsPage() {
  const pillars = usePillarStore((s) => [...s.items].sort((a, b) => a.priority - b.priority));
  const useCases = useUseCaseStore((s) => Object.values(s.items));
  const [showLegacy, setShowLegacy] = useState(false);

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Strategic pillars</h1>
          <p className="mt-1 text-sm text-slate-600">
            Three priority-ordered pillars consolidated from the December 2025 Data Vision.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowLegacy((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
        >
          <Info size={13} aria-hidden="true" />
          {showLegacy ? 'Hide' : 'Show'} Data Vision mapping
        </button>
      </header>

      {showLegacy && (
        <section className="rounded-lg border border-gmp-purple-200 bg-gmp-purple-50 px-4 py-3 text-sm text-gmp-purple-700">
          <h2 className="text-xs font-semibold uppercase tracking-wide">
            Data Vision legacy mapping
          </h2>
          <ul className="mt-2 space-y-1">
            <li>
              <span className="font-semibold">Transparency in the Chain</span> consolidates the
              earlier Traceability and Transparency domains.
            </li>
            <li>
              <span className="font-semibold">Insight-Driven Decision-Making</span> replaces the
              earlier Business Intelligence and Steering pillar.
            </li>
            <li>
              <span className="font-semibold">Market Development</span> replaces the earlier
              Enablement for market and partnerships pillar.
            </li>
          </ul>
        </section>
      )}

      <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {pillars.map((p) => (
          <PillarTile key={p.pillar} pillar={p} useCases={useCases} />
        ))}
      </section>
    </div>
  );
}
