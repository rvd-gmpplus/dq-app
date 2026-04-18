import { cn } from '@/lib/utils';
import type { Quadrant } from '@/types/useCase';

const STYLES: Record<Quadrant, string> = {
  QuickWin: 'bg-gmp-green-50 text-gmp-green-700 border-emerald-200',
  Strategic: 'bg-gmp-purple-50 text-gmp-purple-700 border-gmp-purple-200',
  Filler: 'bg-gmp-orange-50 text-orange-800 border-orange-200',
  DontPursue: 'bg-slate-100 text-slate-600 border-slate-200',
};

const DEFAULT_LABELS: Record<Quadrant, string> = {
  QuickWin: 'Quick win',
  Strategic: 'Strategic bet',
  Filler: 'Filler',
  DontPursue: "Don't pursue",
};

const BCG_LABELS: Record<Quadrant, string> = {
  QuickWin: 'Cash cow',
  Strategic: 'Star',
  Filler: 'Dog',
  DontPursue: 'Question mark',
};

export default function QuadrantBadge({
  quadrant,
  bcg,
  className,
}: {
  quadrant: Quadrant;
  bcg?: boolean;
  className?: string;
}) {
  const label = bcg ? BCG_LABELS[quadrant] : DEFAULT_LABELS[quadrant];
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium',
        STYLES[quadrant],
        className,
      )}
    >
      {label}
    </span>
  );
}
