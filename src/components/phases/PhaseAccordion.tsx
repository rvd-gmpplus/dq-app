import { useState } from 'react';
import { ChevronDown, ChevronRight, Check, Circle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fmtDate } from '@/lib/dates';
import { usePhaseStore } from '@/stores/phaseStore';
import type { Phase } from '@/types/phase';

const STATUS_STYLE: Record<Phase['status'], string> = {
  Completed: 'bg-gmp-green-50 text-gmp-green-700',
  'In Progress': 'bg-gmp-purple-50 text-gmp-purple-700',
  Delayed: 'bg-orange-50 text-orange-700',
  'Not Started': 'bg-slate-100 text-slate-600',
};

export default function PhaseAccordion({ phase }: { phase: Phase }) {
  const [open, setOpen] = useState(phase.status === 'In Progress' || phase.status === 'Delayed');
  const toggleDeliverable = usePhaseStore((s) => s.toggleDeliverable);

  return (
    <article className="rounded-lg border border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-3 text-left"
      >
        <div className="flex items-center gap-3">
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          <span className="font-mono text-xs text-slate-500">Phase {phase.id}</span>
          <h3 className="text-sm font-semibold text-slate-900">{phase.name}</h3>
          <span
            className={cn(
              'rounded-md px-2 py-0.5 text-[11px] font-medium',
              STATUS_STYLE[phase.status],
            )}
          >
            {phase.status}
          </span>
        </div>
        <div className="text-xs text-slate-500">
          {fmtDate(phase.plannedStart)} &rarr; {fmtDate(phase.plannedEnd)}
        </div>
      </button>
      {open && (
        <div className="space-y-4 border-t border-slate-100 px-5 py-4">
          <section>
            <h4 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Deliverables
            </h4>
            <ul className="mt-2 space-y-1 text-sm">
              {phase.deliverables.length === 0 ? (
                <li className="text-xs text-slate-500">No deliverables captured.</li>
              ) : (
                phase.deliverables.map((d) => (
                  <li key={d.name}>
                    <button
                      type="button"
                      onClick={() => toggleDeliverable(phase.id, d.name)}
                      className={cn(
                        'flex w-full items-start gap-2 rounded-md px-2 py-1 text-left transition-colors hover:bg-slate-50',
                        d.done ? 'text-slate-400 line-through' : 'text-slate-800',
                      )}
                    >
                      {d.done ? (
                        <Check size={13} className="mt-0.5 text-gmp-green" aria-hidden="true" />
                      ) : (
                        <Circle size={13} className="mt-0.5 text-slate-300" aria-hidden="true" />
                      )}
                      <span>{d.name}</span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </section>

          {phase.blockers.length > 0 && (
            <section>
              <h4 className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-rose-600">
                <AlertTriangle size={11} aria-hidden="true" />
                Blockers
              </h4>
              <ul className="mt-2 space-y-0.5 text-sm text-rose-700">
                {phase.blockers.map((b) => (
                  <li key={b}>· {b}</li>
                ))}
              </ul>
            </section>
          )}

          <section className="grid grid-cols-2 gap-2 text-xs text-slate-500">
            <div>
              <div className="text-[11px] uppercase tracking-wide">Planned</div>
              <div>
                {fmtDate(phase.plannedStart)} &rarr; {fmtDate(phase.plannedEnd)}
              </div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wide">Actual</div>
              <div>
                {phase.actualStart ? fmtDate(phase.actualStart) : 'not started'}{' '}
                {phase.actualEnd ? `→ ${fmtDate(phase.actualEnd)}` : phase.actualStart ? '→ ongoing' : ''}
              </div>
            </div>
          </section>
        </div>
      )}
    </article>
  );
}
