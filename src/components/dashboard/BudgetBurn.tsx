import { useSettingsStore } from '@/stores/settingsStore';

function euro(n: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(n);
}

export default function BudgetBurn() {
  const budget = useSettingsStore((s) => s.projectBudget);
  const spent = useSettingsStore((s) => s.projectBudgetSpent);
  const tolerance = useSettingsStore((s) => s.budgetTolerance);

  const percent = budget > 0 ? Math.min(100, (spent / budget) * 100) : 0;
  const upperLimit = budget + tolerance;
  const lowerTolerance = Math.max(0, budget - tolerance);
  const lowerPercent = budget > 0 ? (lowerTolerance / upperLimit) * 100 : 0;
  const budgetPercent = budget > 0 ? (budget / upperLimit) * 100 : 0;
  const spentPercent = budget > 0 ? (spent / upperLimit) * 100 : 0;

  const overBudget = spent > budget;
  const overTolerance = spent > budget + tolerance;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Budget</h3>
        <span className="text-xs text-slate-500">
          tolerance ±{euro(tolerance)}
        </span>
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-semibold tabular-nums text-slate-900">{euro(spent)}</span>
        <span className="text-sm text-slate-500">of {euro(budget)}</span>
      </div>
      <div className="mt-3 h-2 rounded-full bg-slate-100">
        <div
          className={`h-2 rounded-full ${overTolerance ? 'bg-rose-500' : overBudget ? 'bg-amber-500' : 'bg-gmp-purple'}`}
          style={{ width: `${spentPercent}%` }}
          role="progressbar"
          aria-valuenow={Math.round(percent)}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      <div className="relative mt-1 h-3 text-[10px] text-slate-400">
        <span
          className="absolute -translate-x-1/2"
          style={{ left: `${lowerPercent}%` }}
          title="Lower tolerance"
        >
          |
        </span>
        <span
          className="absolute -translate-x-1/2 font-medium text-slate-500"
          style={{ left: `${budgetPercent}%` }}
          title="Budget"
        >
          |
        </span>
        <span
          className="absolute -translate-x-1/2"
          style={{ left: '100%' }}
          title="Upper tolerance"
        >
          |
        </span>
      </div>
    </div>
  );
}
