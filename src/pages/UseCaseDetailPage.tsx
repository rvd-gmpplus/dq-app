import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Copy, Printer, Trash2, FileQuestion } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUseCaseStore } from '@/stores/useCaseStore';
import { useSettingsStore } from '@/stores/settingsStore';
import QuadrantBadge from '@/components/common/QuadrantBadge';
import StatusBadge from '@/components/common/StatusBadge';
import PillarBadge from '@/components/common/PillarBadge';
import ConfirmTypedDialog from '@/components/common/ConfirmTypedDialog';
import EmptyState from '@/components/common/EmptyState';
import OverviewTab from '@/components/useCase/OverviewTab';
import ScoringTab from '@/components/useCase/ScoringTab';
import HistoryTimeline from '@/components/useCase/HistoryTimeline';

type Tab = 'overview' | 'scoring' | 'history';

export default function UseCaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const getById = useUseCaseStore((s) => s.getById);
  const create = useUseCaseStore((s) => s.create);
  const remove = useUseCaseStore((s) => s.remove);
  const bcg = useSettingsStore((s) => s.bcgLabels);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const uc = id ? useUseCaseStore((s) => s.items[id]) : undefined;

  const raw = params.get('tab') ?? 'overview';
  const activeTab: Tab = raw === 'scoring' || raw === 'history' ? raw : 'overview';

  useEffect(() => {
    if (!id) return;
    if (!getById(id)) {
      // Navigate back if id is bogus (e.g., after a reset)
      navigate('/use-cases');
    }
  }, [id, getById, navigate]);

  if (!uc) {
    return (
      <EmptyState
        icon={FileQuestion}
        title="Use case not found"
        description="This use case may have been deleted, or the link points at a store that was reset. Return to the list to pick another."
        action={{ label: 'Back to use cases', onClick: () => navigate('/use-cases') }}
      />
    );
  }

  const setTab = (t: Tab) => {
    const next = new URLSearchParams(params);
    if (t === 'overview') next.delete('tab');
    else next.set('tab', t);
    setParams(next, { replace: true });
  };

  const onDuplicate = () => {
    const copy = create({
      title: `Copy of ${uc.title}`.slice(0, 80),
      pillars: uc.pillars,
      owner: uc.owner,
      submittedBy: uc.submittedBy,
    });
    navigate(`/use-cases/${copy.id}`);
  };

  const onDelete = () => setDeleteOpen(true);
  const onDeleteConfirm = () => {
    remove(uc.id);
    setDeleteOpen(false);
    navigate('/use-cases');
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Link
            to="/use-cases"
            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft size={12} aria-hidden="true" />
            Back to use cases
          </Link>
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm text-slate-500">{uc.code}</span>
            <h1 className="text-xl font-semibold text-slate-900">{uc.title}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={uc.status} />
            <QuadrantBadge quadrant={uc.quadrant} bcg={bcg} />
            {uc.pillars.map((p) => (
              <PillarBadge key={p} pillar={p} />
            ))}
            <span className="text-xs text-slate-500">owned by {uc.owner}</span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onDuplicate}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            <Copy size={13} aria-hidden="true" />
            Duplicate
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            <Printer size={13} aria-hidden="true" />
            Print
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex items-center gap-1.5 rounded-md border border-rose-200 bg-white px-3 py-1.5 text-sm text-rose-700 hover:bg-rose-50"
          >
            <Trash2 size={13} aria-hidden="true" />
            Delete
          </button>
        </div>
      </div>

      <div role="tablist" className="flex items-center gap-1 border-b border-slate-200">
        {(
          [
            { id: 'overview' as const, label: 'Overview' },
            { id: 'scoring' as const, label: 'Scoring' },
            { id: 'history' as const, label: 'History and comments' },
          ]
        ).map((t) => {
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.id)}
              className={cn(
                '-mb-px border-b-2 px-3 py-2 text-sm transition-colors',
                active
                  ? 'border-gmp-purple text-gmp-purple-700 font-medium'
                  : 'border-transparent text-slate-600 hover:text-slate-900',
              )}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div>
        {activeTab === 'overview' && <OverviewTab uc={uc} />}
        {activeTab === 'scoring' && <ScoringTab uc={uc} />}
        {activeTab === 'history' && <HistoryTimeline uc={uc} />}
      </div>

      <ConfirmTypedDialog
        open={deleteOpen}
        title={`Delete ${uc.code}?`}
        description={`This removes "${uc.title}" and its history. The action cannot be undone without restoring from a backup.`}
        confirmWord="DELETE"
        confirmButtonLabel="Delete use case"
        onConfirm={onDeleteConfirm}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
}
