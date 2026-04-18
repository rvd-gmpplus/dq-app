import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white px-8 py-14 text-center',
        className,
      )}
    >
      <div className="mb-4 rounded-full bg-gmp-purple-50 p-3 text-gmp-purple-700">
        <Icon size={28} aria-hidden="true" />
      </div>
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      {description && <p className="mt-2 max-w-md text-sm text-slate-600">{description}</p>}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-5 rounded-md bg-gmp-purple px-4 py-2 text-sm font-medium text-white hover:bg-gmp-purple-700"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
