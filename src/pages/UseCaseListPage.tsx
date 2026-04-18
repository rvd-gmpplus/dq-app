import { useMemo, useState } from 'react';
import { ListChecks, Plus, X } from 'lucide-react';
import { useUseCaseStore } from '@/stores/useCaseStore';
import EmptyState from '@/components/common/EmptyState';
import UseCaseFilters from '@/components/useCase/UseCaseFilters';
import UseCaseTable from '@/components/useCase/UseCaseTable';
import UseCaseForm from '@/components/useCase/UseCaseForm';
import { filterUseCases, sortUseCases, type UseCaseSortKey, type SortDir } from '@/lib/useCaseFilters';
import { useUrlFilters } from '@/hooks/useUrlFilters';
import { StatusEnum, type UseCaseStatus } from '@/types/useCase';

export default function UseCaseListPage() {
  const list = useUseCaseStore((s) => Object.values(s.items));
  const bulkUpdateStatus = useUseCaseStore((s) => s.bulkUpdateStatus);

  const [filters, setFilters] = useUrlFilters();
  const [sortKey, setSortKey] = useState<UseCaseSortKey>('code');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [formOpen, setFormOpen] = useState(false);

  const visible = useMemo(() => sortUseCases(filterUseCases(list, filters), sortKey, sortDir), [
    list,
    filters,
    sortKey,
    sortDir,
  ]);

  const onSort = (k: UseCaseSortKey) => {
    if (k === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(k);
      setSortDir(k === 'updatedAt' || k.endsWith('Impact') ? 'desc' : 'asc');
    }
  };

  const onToggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const onToggleSelectAll = () => {
    setSelected((prev) => {
      const allVisible = visible.every((u) => prev.has(u.id));
      if (allVisible) return new Set();
      return new Set(visible.map((u) => u.id));
    });
  };

  const onBulkStatus = (status: UseCaseStatus) => {
    bulkUpdateStatus([...selected], status);
    setSelected(new Set());
  };

  const hasData = list.length > 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Use cases</h1>
          <p className="mt-1 text-sm text-slate-600">
            {hasData
              ? `${visible.length} of ${list.length} use cases`
              : 'Sortable and filterable list across every pillar, status and quadrant.'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setFormOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-md bg-gmp-purple px-3 py-1.5 text-sm font-medium text-white hover:bg-gmp-purple-700"
        >
          <Plus size={14} aria-hidden="true" />
          New use case
        </button>
      </div>

      {hasData ? (
        <>
          <UseCaseFilters value={filters} onChange={setFilters} />
          {selected.size > 0 && (
            <div className="flex items-center justify-between rounded-lg border border-gmp-purple-200 bg-gmp-purple-50 px-4 py-2 text-sm text-gmp-purple-700">
              <span>
                {selected.size} selected
              </span>
              <div className="flex items-center gap-2">
                <label className="text-xs">Change status:</label>
                <select
                  className="rounded-md border border-gmp-purple-200 bg-white px-2 py-1 text-xs"
                  onChange={(e) => {
                    const val = e.target.value as UseCaseStatus | '';
                    if (val !== '') onBulkStatus(val);
                    e.target.value = '';
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>
                    Pick status
                  </option>
                  {StatusEnum.options.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setSelected(new Set())}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs hover:bg-gmp-purple-100"
                >
                  <X size={12} aria-hidden="true" />
                  Clear selection
                </button>
              </div>
            </div>
          )}
          {visible.length > 0 ? (
            <UseCaseTable
              rows={visible}
              selected={selected}
              onToggleSelect={onToggleSelect}
              onToggleSelectAll={onToggleSelectAll}
              sortKey={sortKey}
              sortDir={sortDir}
              onSort={onSort}
            />
          ) : (
            <EmptyState
              icon={ListChecks}
              title="No use cases match these filters"
              description="Try removing a filter or clear all to see every use case."
              action={{ label: 'Clear filters', onClick: () => setFilters({}) }}
            />
          )}
        </>
      ) : (
        <EmptyState
          icon={ListChecks}
          title="Nothing here yet"
          description="Add the first use case to start mapping the Data Quality Project."
          action={{ label: 'Add first use case', onClick: () => setFormOpen(true) }}
        />
      )}

      <UseCaseForm open={formOpen} onClose={() => setFormOpen(false)} />
    </div>
  );
}
