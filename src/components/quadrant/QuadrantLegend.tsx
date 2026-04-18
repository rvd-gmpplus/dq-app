import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import type { Quadrant, UseCase } from '@/types/useCase';
import { PILLAR_COLOUR } from './QuadrantChart';

const QUADRANT_COLOUR: Record<Quadrant, string> = {
  QuickWin: '#38B769',
  Strategic: '#6859A7',
  Filler: '#EA8004',
  DontPursue: '#9CA3AF',
};

const QUADRANT_LABEL: Record<Quadrant, string> = {
  QuickWin: 'Quick wins',
  Strategic: 'Strategic bets',
  Filler: 'Fillers',
  DontPursue: "Don't pursue",
};

const BCG_LABEL: Record<Quadrant, string> = {
  QuickWin: 'Cash cows',
  Strategic: 'Stars',
  Filler: 'Dogs',
  DontPursue: 'Question marks',
};

const QUADRANT_ACTION: Record<Quadrant, string> = {
  QuickWin: 'Act immediately',
  Strategic: 'Put on the roadmap',
  Filler: 'Case by case',
  DontPursue: 'Reject',
};

export default function QuadrantLegend({
  bcg,
  useCases,
}: {
  bcg: boolean;
  useCases: UseCase[];
}) {
  const topQuickWins = [...useCases]
    .filter((u) => u.quadrant === 'QuickWin')
    .sort((a, b) => b.businessImpact.score - a.businessImpact.score)
    .slice(0, 5);

  const quadrants: Quadrant[] = ['QuickWin', 'Strategic', 'Filler', 'DontPursue'];

  return (
    <aside className="flex w-72 shrink-0 flex-col gap-4">
      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Quadrant</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {quadrants.map((q) => (
            <li key={q} className="flex items-start gap-3">
              <span
                className={cn('mt-1 inline-block h-3 w-3 rounded-full')}
                style={{ backgroundColor: QUADRANT_COLOUR[q] }}
                aria-hidden="true"
              />
              <div>
                <div className="font-medium text-slate-800">
                  {bcg ? BCG_LABEL[q] : QUADRANT_LABEL[q]}
                </div>
                <div className="text-[11px] text-slate-500">{QUADRANT_ACTION[q]}</div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Pillar</h2>
        <ul className="mt-3 space-y-1.5 text-sm">
          <li className="flex items-center gap-2">
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ backgroundColor: PILLAR_COLOUR.Transparency }}
              aria-hidden="true"
            />
            <span className="text-slate-700">Transparency in the Chain</span>
          </li>
          <li className="flex items-center gap-2">
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ backgroundColor: PILLAR_COLOUR.Insight }}
              aria-hidden="true"
            />
            <span className="text-slate-700">Insight-Driven Decision-Making</span>
          </li>
          <li className="flex items-center gap-2">
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ backgroundColor: PILLAR_COLOUR.Market }}
              aria-hidden="true"
            />
            <span className="text-slate-700">Market Development</span>
          </li>
        </ul>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Top quick wins this quarter
        </h2>
        {topQuickWins.length === 0 ? (
          <p className="mt-2 text-xs text-slate-500">
            No Quick Wins yet. Score a use case with high business impact and low IT difficulty to
            land one here.
          </p>
        ) : (
          <ul className="mt-2 space-y-1 text-sm">
            {topQuickWins.map((uc) => (
              <li key={uc.id}>
                <Link
                  to={`/use-cases/${uc.id}`}
                  className="flex items-center gap-2 rounded-md px-2 py-1 text-sm hover:bg-slate-50"
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
        )}
      </section>
    </aside>
  );
}
