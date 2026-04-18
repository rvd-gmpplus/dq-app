import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ListChecks, Zap, Grid2X2, CalendarDays } from 'lucide-react';
import { useUseCaseStore } from '@/stores/useCaseStore';
import { usePhaseStore } from '@/stores/phaseStore';
import KPITile from '@/components/common/KPITile';
import QuadrantDonut from '@/components/dashboard/QuadrantDonut';
import MiniQuadrant from '@/components/dashboard/MiniQuadrant';
import DeliverablesChecklist from '@/components/dashboard/DeliverablesChecklist';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import BudgetBurn from '@/components/dashboard/BudgetBurn';
import { fmtDate } from '@/lib/dates';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const list = useUseCaseStore((s) => Object.values(s.items));
  const phases = usePhaseStore((s) => s.items);
  const navigate = useNavigate();

  const scored = useMemo(
    () => list.filter((u) => u.status !== 'Idea' && u.status !== 'Rejected'),
    [list],
  );
  const quickWins = scored.filter((u) => u.quadrant === 'QuickWin').length;

  const completedPhases = phases.filter((p) => p.status === 'Completed').length;
  const totalPhases = phases.length || 1;
  const phaseProgress = Math.round((completedPhases / totalPhases) * 100);
  const current = phases.find((p) => p.status === 'In Progress' || p.status === 'Delayed');

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">
          One place to see where the Data Quality Project stands today.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPITile
          icon={ListChecks}
          label="Total use cases"
          value={list.length}
          hint={`${scored.length} scored`}
          onClick={() => navigate('/use-cases')}
        />
        <KPITile
          icon={Zap}
          label="Quick wins"
          value={quickWins}
          hint="High business, low IT"
          tone="green"
          onClick={() => navigate('/quadrant?quadrant=QuickWin')}
        />
        <KPITile
          icon={Grid2X2}
          label="Scored on quadrant"
          value={scored.length}
          hint={scored.length === list.length ? 'Everything scored' : `${list.length - scored.length} still as ideas`}
          tone="purple"
          onClick={() => navigate('/quadrant')}
        />
        <KPITile
          icon={CalendarDays}
          label="Phase progress"
          value={`${phaseProgress}%`}
          hint={current ? `Now: ${current.name}` : 'All phases done'}
          tone="orange"
          onClick={() => navigate('/phases')}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MiniQuadrant useCases={scored} />
        </div>
        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-slate-900">Quadrant distribution</h3>
            <div className="mt-3 h-48">
              <QuadrantDonut useCases={scored} />
            </div>
            <div className="mt-2 text-xs text-slate-500">
              <Link to="/quadrant" className="hover:text-gmp-purple-700">
                See full quadrant &rarr;
              </Link>
            </div>
          </div>
          <BudgetBurn />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <DeliverablesChecklist />
        <ActivityFeed />
      </section>

      {current && (
        <p className="text-xs text-slate-500">
          Deep Dive phase runs from {fmtDate(current.plannedStart)} to {fmtDate(current.plannedEnd)}.
        </p>
      )}
    </div>
  );
}
