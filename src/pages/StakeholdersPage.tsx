import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStakeholderStore } from '@/stores/stakeholderStore';
import { StakeholderGroupEnum } from '@/types/stakeholder';
import type { StakeholderGroup } from '@/types/stakeholder';
import StakeholderCard from '@/components/stakeholders/StakeholderCard';

export default function StakeholdersPage() {
  const stakeholders = useStakeholderStore((s) => Object.values(s.items));
  const [group, setGroup] = useState<StakeholderGroup | 'All'>('All');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return stakeholders
      .filter((s) => (group === 'All' ? true : s.group === group))
      .filter((s) =>
        q === ''
          ? true
          : s.name.toLowerCase().includes(q) ||
            s.role.toLowerCase().includes(q) ||
            (s.notes?.toLowerCase().includes(q) ?? false),
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [stakeholders, group, search]);

  const groups: ('All' | StakeholderGroup)[] = ['All', ...StakeholderGroupEnum.options];

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-xl font-semibold text-slate-900">Stakeholders</h1>
        <p className="mt-1 text-sm text-slate-600">
          The team around the Data Quality Project, filterable by group.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1 max-w-md">
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Search by name, role, or note"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-sm focus:border-gmp-purple focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-1">
          {groups.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGroup(g)}
              className={cn(
                'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                group === g
                  ? 'bg-gmp-purple text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50',
              )}
            >
              {g}
            </button>
          ))}
        </div>
        <span className="ml-auto text-xs text-slate-500">
          {filtered.length} of {stakeholders.length}
        </span>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((s) => (
          <StakeholderCard key={s.id} stakeholder={s} />
        ))}
      </section>
    </div>
  );
}
