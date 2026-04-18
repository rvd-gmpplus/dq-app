import { useStakeholderStore } from '@/stores/stakeholderStore';
import RaciMatrix from '@/components/governance/RaciMatrix';

export default function GovernancePage() {
  const sponsors = useStakeholderStore((s) =>
    Object.values(s.items).filter((x) => x.group === 'Sponsor' || x.pillar !== undefined),
  );

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-xl font-semibold text-slate-900">Data governance</h1>
        <p className="mt-1 text-sm text-slate-600">
          RACI matrix across stakeholders and key data objects. Supports the Data Governance Group.
        </p>
      </header>

      <RaciMatrix />

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-slate-900">Data Governance Group</h2>
          <p className="mt-1 text-xs text-slate-500">
            Sponsors and pillar owners responsible for feed-data policy decisions.
          </p>
          {sponsors.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">
              Add stakeholders tagged as Sponsor or with a pillar to populate this list.
            </p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {sponsors.map((s) => (
                <li key={s.id} className="flex flex-col">
                  <span className="font-medium text-slate-800">{s.name}</span>
                  <span className="text-xs text-slate-500">{s.role}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-slate-900">Data ownership policy</h2>
          <p className="mt-2 text-sm text-slate-700">
            Every key data object has a single accountable owner. The accountable stakeholder
            defines acceptable values, signs off validation rules, and resolves quality incidents.
            Responsible parties carry out day-to-day maintenance. Consulted parties are subject
            matter experts invited to reviews. Informed parties receive periodic reports.
          </p>
          <p className="mt-3 text-xs text-slate-500">
            This excerpt summarises the full Data Strategy (v0.3). The complete policy will be
            linked here when published.
          </p>
        </div>
      </section>
    </div>
  );
}
