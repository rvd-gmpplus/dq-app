import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { fmtRelative } from '@/lib/dates';
import PillarBadge from '@/components/common/PillarBadge';
import QuadrantBadge from '@/components/common/QuadrantBadge';
import StatusBadge from '@/components/common/StatusBadge';
import type { UseCase } from '@/types/useCase';
import type { UseCaseSortKey, SortDir } from '@/lib/useCaseFilters';
import { useSettingsStore } from '@/stores/settingsStore';

type Column = {
  key: UseCaseSortKey;
  label: string;
  align?: 'left' | 'right';
};

const COLUMNS: readonly Column[] = [
  { key: 'code', label: 'Code' },
  { key: 'title', label: 'Title' },
  { key: 'owner', label: 'Owner' },
  { key: 'businessImpact', label: 'Business', align: 'right' },
  { key: 'itDataImpact', label: 'IT / Data', align: 'right' },
  { key: 'quadrant', label: 'Quadrant' },
  { key: 'status', label: 'Status' },
  { key: 'updatedAt', label: 'Updated' },
];

export default function UseCaseTable({
  rows,
  selected,
  onToggleSelect,
  onToggleSelectAll,
  sortKey,
  sortDir,
  onSort,
}: {
  rows: UseCase[];
  selected: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  sortKey: UseCaseSortKey;
  sortDir: SortDir;
  onSort: (k: UseCaseSortKey) => void;
}) {
  const navigate = useNavigate();
  const bcg = useSettingsStore((s) => s.bcgLabels);

  const allChecked = rows.length > 0 && rows.every((r) => selected.has(r.id));
  const someChecked = rows.some((r) => selected.has(r.id));

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
          <tr>
            <th className="w-10 px-3 py-2 text-left">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-gmp-purple focus:ring-gmp-purple"
                aria-label="Select all"
                checked={allChecked}
                ref={(el) => {
                  if (el) el.indeterminate = someChecked && !allChecked;
                }}
                onChange={onToggleSelectAll}
              />
            </th>
            {COLUMNS.map((col) => {
              const isActive = col.key === sortKey;
              const Arrow = !isActive ? ChevronsUpDown : sortDir === 'asc' ? ChevronUp : ChevronDown;
              return (
                <th
                  key={col.key}
                  className={cn(
                    'px-3 py-2 font-medium',
                    col.align === 'right' ? 'text-right' : 'text-left',
                  )}
                >
                  <button
                    type="button"
                    onClick={() => onSort(col.key)}
                    className={cn(
                      'inline-flex items-center gap-1 hover:text-slate-900',
                      isActive && 'text-slate-900',
                    )}
                  >
                    <span>{col.label}</span>
                    <Arrow size={12} aria-hidden="true" />
                  </button>
                </th>
              );
            })}
            <th className="px-3 py-2 text-left font-medium">Pillars</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((uc) => (
            <tr
              key={uc.id}
              className="cursor-pointer hover:bg-slate-50"
              onClick={(e) => {
                // Ignore clicks that originate on the checkbox cell
                if ((e.target as HTMLElement).closest('input[type=checkbox]')) return;
                navigate(`/use-cases/${uc.id}`);
              }}
            >
              <td className="px-3 py-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-gmp-purple focus:ring-gmp-purple"
                  aria-label={`Select ${uc.code}`}
                  checked={selected.has(uc.id)}
                  onChange={() => onToggleSelect(uc.id)}
                  onClick={(e) => e.stopPropagation()}
                />
              </td>
              <td className="px-3 py-2 font-mono text-[12px] text-slate-500">{uc.code}</td>
              <td className="px-3 py-2 font-medium text-slate-800">{uc.title}</td>
              <td className="px-3 py-2 text-slate-600">{uc.owner}</td>
              <td className="px-3 py-2 text-right tabular-nums text-slate-700">
                {uc.businessImpact.score.toFixed(1)}
              </td>
              <td className="px-3 py-2 text-right tabular-nums text-slate-700">
                {uc.itDataImpact.score.toFixed(1)}
              </td>
              <td className="px-3 py-2">
                <QuadrantBadge quadrant={uc.quadrant} bcg={bcg} />
              </td>
              <td className="px-3 py-2">
                <StatusBadge status={uc.status} />
              </td>
              <td className="px-3 py-2 text-slate-500">{fmtRelative(uc.updatedAt)}</td>
              <td className="px-3 py-2">
                <div className="flex flex-wrap gap-1">
                  {uc.pillars.map((p) => (
                    <PillarBadge key={p} pillar={p} />
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
