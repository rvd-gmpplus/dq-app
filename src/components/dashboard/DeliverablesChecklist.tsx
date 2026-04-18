import { Check, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePhaseStore } from '@/stores/phaseStore';

export default function DeliverablesChecklist() {
  const phases = usePhaseStore((s) => s.items);
  const toggleDeliverable = usePhaseStore((s) => s.toggleDeliverable);

  const current = phases.find((p) => p.status === 'In Progress' || p.status === 'Delayed') ?? phases[0];
  if (!current) return null;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-slate-900">
          Current phase: {current.name}
        </h3>
        <span className="text-[11px] uppercase tracking-wide text-slate-500">
          {current.status}
        </span>
      </div>
      <ul className="mt-3 space-y-2 text-sm">
        {current.deliverables.map((d) => (
          <li key={d.name}>
            <button
              type="button"
              onClick={() => toggleDeliverable(current.id, d.name)}
              className={cn(
                'flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-slate-50',
                d.done ? 'text-slate-400 line-through' : 'text-slate-800',
              )}
            >
              {d.done ? (
                <Check size={14} className="mt-0.5 shrink-0 text-gmp-green" aria-hidden="true" />
              ) : (
                <Circle size={14} className="mt-0.5 shrink-0 text-slate-300" aria-hidden="true" />
              )}
              <span>{d.name}</span>
            </button>
          </li>
        ))}
      </ul>
      {current.blockers.length > 0 && (
        <div className="mt-4 border-t border-slate-100 pt-3">
          <h4 className="text-[11px] font-semibold uppercase tracking-wide text-rose-600">
            Blockers
          </h4>
          <ul className="mt-1 space-y-0.5 text-xs text-rose-700">
            {current.blockers.map((b) => (
              <li key={b}>· {b}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
