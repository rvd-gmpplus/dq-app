import { Link } from 'react-router-dom';
import { fmtRelative } from '@/lib/dates';
import { useUseCaseStore } from '@/stores/useCaseStore';

type Event = {
  at: string;
  by: string;
  action: string;
  ucId: string;
  ucCode: string;
  ucTitle: string;
};

export default function ActivityFeed() {
  const useCases = useUseCaseStore((s) => Object.values(s.items));

  const events: Event[] = [];
  for (const uc of useCases) {
    for (const h of uc.history) {
      events.push({
        at: h.at,
        by: h.by,
        action: h.action,
        ucId: uc.id,
        ucCode: uc.code,
        ucTitle: uc.title,
      });
    }
    for (const c of uc.comments) {
      events.push({
        at: c.at,
        by: c.by,
        action: 'commented',
        ucId: uc.id,
        ucCode: uc.code,
        ucTitle: uc.title,
      });
    }
  }
  events.sort((a, b) => (a.at < b.at ? 1 : -1));
  const recent = events.slice(0, 10);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-slate-900">Recent activity</h3>
      {recent.length === 0 ? (
        <p className="mt-2 text-xs text-slate-500">
          Edits, scoring changes, and comments will appear here.
        </p>
      ) : (
        <ul className="mt-3 space-y-2 text-sm">
          {recent.map((e, idx) => (
            <li key={`${e.ucId}-${e.at}-${idx}`} className="flex flex-col">
              <Link
                to={`/use-cases/${e.ucId}`}
                className="flex items-baseline gap-2 text-slate-700 hover:text-gmp-purple-700"
              >
                <span className="font-mono text-[11px] text-slate-500">{e.ucCode}</span>
                <span className="truncate">{e.ucTitle}</span>
              </Link>
              <div className="text-[11px] text-slate-500">
                {e.by} {e.action} · {fmtRelative(e.at)}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
