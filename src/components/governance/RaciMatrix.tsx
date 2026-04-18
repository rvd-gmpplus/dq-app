import { Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import EmptyState from '@/components/common/EmptyState';
import { useStakeholderStore } from '@/stores/stakeholderStore';
import { useDataObjectStore } from '@/stores/dataObjectStore';
import { useRaciStore } from '@/stores/raciStore';
import type { RaciLetter } from '@/types/stakeholder';

const CYCLE: (RaciLetter | null)[] = ['R', 'A', 'C', 'I', null];

const RACI_STYLE: Record<RaciLetter, string> = {
  R: 'bg-gmp-purple text-white',
  A: 'bg-gmp-green text-white',
  C: 'bg-gmp-orange text-white',
  I: 'bg-slate-500 text-white',
};

function nextDesignation(current: RaciLetter | undefined | null): RaciLetter | null {
  const idx = CYCLE.findIndex((x) => x === (current ?? null));
  const next = CYCLE[(idx + 1) % CYCLE.length] ?? null;
  return next;
}

export default function RaciMatrix() {
  const stakeholders = useStakeholderStore((s) =>
    [...Object.values(s.items)].sort((a, b) => a.name.localeCompare(b.name)),
  );
  const dataObjects = useDataObjectStore((s) =>
    [...Object.values(s.items)].sort((a, b) => a.name.localeCompare(b.name)),
  );
  // Subscribe to items so the matrix rerenders on every mutation.
  const items = useRaciStore((s) => s.items);
  const setCell = useRaciStore((s) => s.setCell);
  const getCell = (stakeholderId: string, dataObjectId: string) =>
    Object.values(items).find(
      (a) => a.stakeholderId === stakeholderId && a.dataObjectId === dataObjectId,
    );

  if (stakeholders.length === 0 || dataObjects.length === 0) {
    return (
      <EmptyState
        icon={Shield}
        title="Matrix needs stakeholders and data objects"
        description={
          stakeholders.length === 0 && dataObjects.length === 0
            ? 'Add at least one stakeholder and one data object before the RACI grid can be drawn.'
            : stakeholders.length === 0
              ? 'Add at least one stakeholder to populate the rows of the RACI grid.'
              : 'Add at least one data object to populate the columns of the RACI grid.'
        }
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="min-w-full text-xs">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 w-64 border-b border-r border-slate-200 bg-slate-50 px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Stakeholder
            </th>
            {dataObjects.map((d) => (
              <th
                key={d.id}
                className="border-b border-r border-slate-200 bg-slate-50 px-2 py-2 text-left text-[11px] font-medium text-slate-600"
              >
                <div className="truncate" title={d.name}>
                  {d.name}
                </div>
                <div className="text-[10px] text-slate-400">{d.system}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {stakeholders.map((s) => (
            <tr key={s.id}>
              <th className="sticky left-0 z-10 border-b border-r border-slate-200 bg-white px-3 py-2 text-left text-xs font-medium text-slate-700">
                <div>{s.name}</div>
                <div className="text-[10px] text-slate-500">{s.role}</div>
              </th>
              {dataObjects.map((d) => {
                const cell = getCell(s.id, d.id);
                const designation = cell?.designation;
                return (
                  <td
                    key={d.id}
                    className="border-b border-r border-slate-100 p-1 text-center align-middle"
                  >
                    <button
                      type="button"
                      aria-label={`RACI for ${s.name} on ${d.name}`}
                      onClick={() => setCell(s.id, d.id, nextDesignation(designation))}
                      className={cn(
                        'mx-auto inline-flex h-7 w-7 items-center justify-center rounded-md text-[11px] font-semibold transition-colors',
                        designation ? RACI_STYLE[designation] : 'bg-slate-50 text-slate-400 hover:bg-slate-100',
                      )}
                    >
                      {designation ?? '·'}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="border-t border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-500">
        Click a cell to cycle R &rarr; A &rarr; C &rarr; I &rarr; blank.
      </div>
    </div>
  );
}
