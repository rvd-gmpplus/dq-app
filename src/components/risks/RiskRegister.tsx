import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRiskStore } from '@/stores/riskStore';
import { RiskStatusEnum } from '@/types/risk';
import type { Risk, RiskStatus } from '@/types/risk';

const STATUS_STYLE: Record<RiskStatus, string> = {
  Open: 'bg-rose-50 text-rose-700',
  Monitoring: 'bg-amber-50 text-amber-700',
  Mitigated: 'bg-gmp-green-50 text-gmp-green-700',
  Closed: 'bg-slate-100 text-slate-600',
};

function scoreColour(n: number): string {
  if (n <= 4) return 'text-gmp-green-700';
  if (n <= 9) return 'text-amber-700';
  if (n <= 15) return 'text-orange-700';
  return 'text-rose-700';
}

export default function RiskRegister({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  const risks = useRiskStore((s) => [...Object.values(s.items)].sort((a, b) => b.score - a.score));
  const update = useRiskStore((s) => s.update);
  const remove = useRiskStore((s) => s.remove);
  const create = useRiskStore((s) => s.create);
  const [adding, setAdding] = useState(false);

  const onAddRow = () => {
    const fresh = create({
      title: 'New risk',
      likelihood: 3,
      impact: 3,
      mitigation: '',
      owner: 'Mirella van der Kleij',
      status: 'Open',
    });
    onSelect(fresh.id);
    setAdding(false);
  };

  return (
    <div id="register" className="rounded-lg border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Risk register</h2>
          <p className="text-xs text-slate-500">Sorted by score descending.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (adding) return;
            setAdding(true);
            onAddRow();
          }}
          className="inline-flex items-center gap-1.5 rounded-md bg-gmp-purple px-2.5 py-1 text-xs font-medium text-white hover:bg-gmp-purple-700"
        >
          <Plus size={12} />
          Add risk
        </button>
      </div>

      {risks.length === 0 ? (
        <div className="px-4 py-8 text-center text-sm text-slate-500">
          No risks captured yet. Add one to map it on the heatmap.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Title</th>
                <th className="px-3 py-2 text-right font-medium">Likelihood</th>
                <th className="px-3 py-2 text-right font-medium">Impact</th>
                <th className="px-3 py-2 text-right font-medium">Score</th>
                <th className="px-3 py-2 text-left font-medium">Mitigation</th>
                <th className="px-3 py-2 text-left font-medium">Owner</th>
                <th className="px-3 py-2 text-left font-medium">Status</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {risks.map((r) => (
                <RegisterRow
                  key={r.id}
                  risk={r}
                  selected={selected === r.id}
                  onSelect={() => onSelect(r.id)}
                  onUpdate={(patch) => update(r.id, patch)}
                  onRemove={() => remove(r.id)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function RegisterRow({
  risk,
  selected,
  onSelect,
  onUpdate,
  onRemove,
}: {
  risk: Risk;
  selected: boolean;
  onSelect: () => void;
  onUpdate: (patch: Partial<Omit<Risk, 'id' | 'score'>>) => void;
  onRemove: () => void;
}) {
  return (
    <tr
      className={cn('transition-colors', selected ? 'bg-gmp-purple-50' : 'hover:bg-slate-50')}
      onClick={onSelect}
    >
      <td className="px-3 py-2">
        <input
          type="text"
          value={risk.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          className="w-full border-none bg-transparent text-sm focus:outline-none"
        />
      </td>
      <td className="px-3 py-2 text-right">
        <input
          type="number"
          min={1}
          max={5}
          value={risk.likelihood}
          onChange={(e) => onUpdate({ likelihood: Math.min(5, Math.max(1, parseInt(e.target.value) || 1)) as 1 | 2 | 3 | 4 | 5 })}
          className="w-14 rounded-md border border-slate-200 bg-white px-2 py-1 text-right text-sm focus:border-gmp-purple focus:outline-none"
        />
      </td>
      <td className="px-3 py-2 text-right">
        <input
          type="number"
          min={1}
          max={5}
          value={risk.impact}
          onChange={(e) => onUpdate({ impact: Math.min(5, Math.max(1, parseInt(e.target.value) || 1)) as 1 | 2 | 3 | 4 | 5 })}
          className="w-14 rounded-md border border-slate-200 bg-white px-2 py-1 text-right text-sm focus:border-gmp-purple focus:outline-none"
        />
      </td>
      <td className={cn('px-3 py-2 text-right tabular-nums font-semibold', scoreColour(risk.score))}>
        {risk.score}
      </td>
      <td className="px-3 py-2">
        <input
          type="text"
          value={risk.mitigation}
          onChange={(e) => onUpdate({ mitigation: e.target.value })}
          placeholder="How is this being mitigated?"
          className="w-full border-none bg-transparent text-sm placeholder:text-slate-400 focus:outline-none"
        />
      </td>
      <td className="px-3 py-2">
        <input
          type="text"
          value={risk.owner}
          onChange={(e) => onUpdate({ owner: e.target.value })}
          className="w-full border-none bg-transparent text-sm focus:outline-none"
        />
      </td>
      <td className="px-3 py-2">
        <select
          value={risk.status}
          onChange={(e) => onUpdate({ status: e.target.value as RiskStatus })}
          className={cn(
            'rounded-md border-none px-2 py-0.5 text-[11px] font-medium focus:outline-none focus:ring-2 focus:ring-gmp-purple',
            STATUS_STYLE[risk.status],
          )}
        >
          {RiskStatusEnum.options.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </td>
      <td className="px-3 py-2 text-right">
        <button
          type="button"
          aria-label="Delete risk"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="rounded-md p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
        >
          <Trash2 size={13} />
        </button>
      </td>
    </tr>
  );
}
