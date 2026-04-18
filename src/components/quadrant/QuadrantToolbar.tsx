import { Download, Filter, Image } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PillarEnum } from '@/types/useCase';
import type { UseCaseFilters } from '@/lib/useCaseFilters';
import type { Pillar } from '@/types/useCase';
import { useState } from 'react';

function toggle<T>(list: T[] | undefined, value: T): T[] {
  const current = list ?? [];
  return current.includes(value) ? current.filter((x) => x !== value) : [...current, value];
}

export default function QuadrantToolbar({
  filters,
  onFilters,
  bcg,
  onBcg,
  groupByPillar,
  onGroupByPillar,
  colourBlindMode,
  onColourBlindMode,
  onExportPng,
  onExportPdf,
}: {
  filters: UseCaseFilters;
  onFilters: (f: UseCaseFilters) => void;
  bcg: boolean;
  onBcg: (v: boolean) => void;
  groupByPillar: boolean;
  onGroupByPillar: (v: boolean) => void;
  colourBlindMode: boolean;
  onColourBlindMode: (v: boolean) => void;
  onExportPng: () => void;
  onExportPdf: () => void;
}) {
  const [open, setOpen] = useState(false);
  const activePillars = filters.pillars ?? [];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm',
            activePillars.length > 0
              ? 'border-gmp-purple bg-gmp-purple-50 text-gmp-purple-700'
              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
          )}
        >
          <Filter size={13} aria-hidden="true" />
          Pillars{activePillars.length > 0 ? ` · ${activePillars.length}` : ''}
        </button>
        {open && (
          <div className="absolute right-0 z-20 mt-1 w-52 rounded-md border border-slate-200 bg-white p-2 text-sm shadow-lg">
            {PillarEnum.options.map((p) => {
              const checked = activePillars.includes(p);
              return (
                <label
                  key={p}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 hover:bg-slate-50"
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-gmp-purple focus:ring-gmp-purple"
                    checked={checked}
                    onChange={() =>
                      onFilters({ ...filters, pillars: toggle<Pillar>(filters.pillars, p) })
                    }
                  />
                  <span className="text-slate-700">{p}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      <label className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-slate-300 text-gmp-purple focus:ring-gmp-purple"
          checked={bcg}
          onChange={(e) => onBcg(e.target.checked)}
        />
        BCG labels
      </label>

      <label className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-slate-300 text-gmp-purple focus:ring-gmp-purple"
          checked={groupByPillar}
          onChange={(e) => onGroupByPillar(e.target.checked)}
        />
        Group by pillar
      </label>

      <label className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-slate-300 text-gmp-purple focus:ring-gmp-purple"
          checked={colourBlindMode}
          onChange={(e) => onColourBlindMode(e.target.checked)}
        />
        Colour-blind mode
      </label>

      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          onClick={onExportPng}
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
        >
          <Image size={13} aria-hidden="true" />
          Export PNG
        </button>
        <button
          type="button"
          onClick={onExportPdf}
          className="inline-flex items-center gap-1.5 rounded-md bg-gmp-purple px-3 py-1.5 text-sm font-medium text-white hover:bg-gmp-purple-700"
        >
          <Download size={13} aria-hidden="true" />
          Export PDF
        </button>
      </div>
    </div>
  );
}
