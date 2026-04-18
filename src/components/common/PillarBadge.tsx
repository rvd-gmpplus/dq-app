import { cn } from '@/lib/utils';
import type { Pillar } from '@/types/useCase';

const STYLES: Record<Pillar, string> = {
  Transparency: 'bg-gmp-purple-50 text-gmp-purple-700 border-gmp-purple-200',
  Insight: 'bg-gmp-green-50 text-gmp-green-700 border-emerald-200',
  Market: 'bg-gmp-orange-50 text-orange-800 border-orange-200',
};

const LABELS: Record<Pillar, string> = {
  Transparency: 'Transparency',
  Insight: 'Insight',
  Market: 'Market',
};

export default function PillarBadge({
  pillar,
  className,
  title,
}: {
  pillar: Pillar;
  className?: string;
  title?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium',
        STYLES[pillar],
        className,
      )}
      title={title}
    >
      {LABELS[pillar]}
    </span>
  );
}
