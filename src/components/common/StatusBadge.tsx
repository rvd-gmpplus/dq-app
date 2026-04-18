import { cn } from '@/lib/utils';
import type { UseCaseStatus } from '@/types/useCase';

const STYLES: Record<UseCaseStatus, string> = {
  Idea: 'bg-slate-100 text-slate-600',
  Backlog: 'bg-slate-100 text-slate-700',
  'In Progress': 'bg-gmp-purple-50 text-gmp-purple-700',
  Completed: 'bg-gmp-green-50 text-gmp-green-700',
  Parked: 'bg-amber-50 text-amber-700',
  Rejected: 'bg-rose-50 text-rose-700',
};

export default function StatusBadge({
  status,
  className,
}: {
  status: UseCaseStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium',
        STYLES[status],
        className,
      )}
    >
      {status}
    </span>
  );
}
