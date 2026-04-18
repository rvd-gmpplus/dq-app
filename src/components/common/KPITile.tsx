import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function KPITile({
  icon: Icon,
  label,
  value,
  hint,
  tone = 'purple',
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  hint?: string;
  tone?: 'purple' | 'green' | 'orange' | 'neutral';
  onClick?: () => void;
}) {
  const toneStyles: Record<string, string> = {
    purple: 'bg-gmp-purple-50 text-gmp-purple-700',
    green: 'bg-gmp-green-50 text-gmp-green-700',
    orange: 'bg-gmp-orange-50 text-orange-700',
    neutral: 'bg-slate-100 text-slate-600',
  };
  const Component: 'button' | 'div' = onClick ? 'button' : 'div';
  return (
    <Component
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'flex flex-col gap-2 rounded-lg border border-slate-200 bg-white px-5 py-4 text-left shadow-sm',
        onClick && 'transition hover:border-gmp-purple-200 hover:shadow',
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</span>
        <span className={cn('rounded-md p-1.5', toneStyles[tone])}>
          <Icon size={14} aria-hidden="true" />
        </span>
      </div>
      <div className="text-3xl font-semibold tabular-nums text-slate-900">{value}</div>
      {hint && <div className="text-xs text-slate-500">{hint}</div>}
    </Component>
  );
}
