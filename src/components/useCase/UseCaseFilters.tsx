import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PillarEnum, StatusEnum, QuadrantEnum } from '@/types/useCase';
import type { Pillar, UseCaseStatus, Quadrant } from '@/types/useCase';
import type { UseCaseFilters as Filters } from '@/lib/useCaseFilters';

function toggle<T>(list: T[] | undefined, value: T): T[] {
  const current = list ?? [];
  return current.includes(value) ? current.filter((x) => x !== value) : [...current, value];
}

function Chip({
  label,
  active,
  onClick,
  tone = 'neutral',
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  tone?: 'neutral' | 'purple' | 'green' | 'orange' | 'grey';
}) {
  const toneStyles: Record<string, string> = {
    neutral: active ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 hover:bg-slate-50',
    purple: active ? 'bg-gmp-purple text-white' : 'bg-white text-gmp-purple-700 hover:bg-gmp-purple-50',
    green: active ? 'bg-gmp-green text-white' : 'bg-white text-gmp-green-700 hover:bg-gmp-green-50',
    orange: active ? 'bg-gmp-orange text-white' : 'bg-white text-orange-700 hover:bg-gmp-orange-50',
    grey: active ? 'bg-slate-500 text-white' : 'bg-white text-slate-600 hover:bg-slate-100',
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-medium transition-colors',
        toneStyles[tone],
      )}
    >
      {label}
    </button>
  );
}

const PILLAR_TONES: Record<Pillar, 'purple' | 'green' | 'orange'> = {
  Transparency: 'purple',
  Insight: 'green',
  Market: 'orange',
};

const QUADRANT_TONES: Record<Quadrant, 'green' | 'purple' | 'orange' | 'grey'> = {
  QuickWin: 'green',
  Strategic: 'purple',
  Filler: 'orange',
  DontPursue: 'grey',
};

const QUADRANT_LABELS: Record<Quadrant, string> = {
  QuickWin: 'Quick win',
  Strategic: 'Strategic',
  Filler: 'Filler',
  DontPursue: "Don't pursue",
};

export default function UseCaseFilters({
  value,
  onChange,
}: {
  value: Filters;
  onChange: (next: Filters) => void;
}) {
  const hasAny =
    (value.pillars?.length ?? 0) +
      (value.statuses?.length ?? 0) +
      (value.quadrants?.length ?? 0) >
      0 ||
    (value.owner ?? '').trim().length > 0 ||
    (value.tag ?? '').trim().length > 0 ||
    (value.search ?? '').trim().length > 0;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3">
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative min-w-[220px] flex-1">
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Search use cases"
            className="w-full rounded-md border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-sm placeholder:text-slate-400 focus:border-gmp-purple focus:outline-none"
            value={value.search ?? ''}
            onChange={(e) => onChange({ ...value, search: e.target.value })}
          />
        </div>
        <input
          type="text"
          placeholder="Owner"
          className="w-40 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm placeholder:text-slate-400 focus:border-gmp-purple focus:outline-none"
          value={value.owner ?? ''}
          onChange={(e) => onChange({ ...value, owner: e.target.value })}
        />
        <input
          type="text"
          placeholder="Tag"
          className="w-32 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm placeholder:text-slate-400 focus:border-gmp-purple focus:outline-none"
          value={value.tag ?? ''}
          onChange={(e) => onChange({ ...value, tag: e.target.value })}
        />
        {hasAny && (
          <button
            type="button"
            onClick={() => onChange({})}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-slate-500 hover:text-slate-900"
          >
            <X size={12} aria-hidden="true" />
            Clear filters
          </button>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-400">Pillar</span>
        <div className="flex flex-wrap gap-1.5">
          {PillarEnum.options.map((p) => (
            <Chip
              key={p}
              label={p}
              active={value.pillars?.includes(p) ?? false}
              tone={PILLAR_TONES[p]}
              onClick={() => onChange({ ...value, pillars: toggle<Pillar>(value.pillars, p) })}
            />
          ))}
        </div>
        <span className="ml-4 text-xs font-medium uppercase tracking-wide text-slate-400">
          Status
        </span>
        <div className="flex flex-wrap gap-1.5">
          {StatusEnum.options.map((s) => (
            <Chip
              key={s}
              label={s}
              active={value.statuses?.includes(s) ?? false}
              onClick={() => onChange({ ...value, statuses: toggle<UseCaseStatus>(value.statuses, s) })}
            />
          ))}
        </div>
        <span className="ml-4 text-xs font-medium uppercase tracking-wide text-slate-400">
          Quadrant
        </span>
        <div className="flex flex-wrap gap-1.5">
          {QuadrantEnum.options.map((q) => (
            <Chip
              key={q}
              label={QUADRANT_LABELS[q]}
              active={value.quadrants?.includes(q) ?? false}
              tone={QUADRANT_TONES[q]}
              onClick={() => onChange({ ...value, quadrants: toggle<Quadrant>(value.quadrants, q) })}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
