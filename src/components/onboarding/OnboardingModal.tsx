import { Grid2X2, ListPlus, BarChart3, X } from 'lucide-react';
import { useSettingsStore } from '@/stores/settingsStore';

export default function OnboardingModal() {
  const dismissed = useSettingsStore((s) => s.onboardingDismissed);
  const dismiss = useSettingsStore((s) => s.dismissOnboarding);
  if (dismissed) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <div className="relative w-full max-w-xl rounded-lg border border-slate-200 bg-white shadow-2xl">
        <button
          type="button"
          aria-label="Close"
          onClick={dismiss}
          className="absolute right-3 top-3 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          <X size={16} />
        </button>
        <div className="px-7 py-6">
          <h2 id="onboarding-title" className="text-lg font-semibold text-slate-900">
            Welcome to the GMP+ DQ app 👋
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            One place on Tuesday morning to know where each use case stands, which ones to push
            this sprint, which ones to kill, and what to tell the MT on Friday.
          </p>

          <h3 className="mt-5 text-xs font-semibold uppercase tracking-wide text-slate-500">
            How the quadrant works
          </h3>
          <p className="mt-2 text-sm text-slate-700">
            Every use case is scored on two axes (each 1 to 5). The quadrant places it in one of
            four buckets:
          </p>
          <ul className="mt-3 space-y-1 text-sm">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-gmp-green" aria-hidden="true" />
              <span><span className="font-semibold">Quick wins</span> — act immediately.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-gmp-purple" aria-hidden="true" />
              <span><span className="font-semibold">Strategic bets</span> — put on the roadmap.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-gmp-orange" aria-hidden="true" />
              <span><span className="font-semibold">Fillers</span> — decide case by case.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-slate-400" aria-hidden="true" />
              <span><span className="font-semibold">Don't pursue</span> — reject.</span>
            </li>
          </ul>

          <h3 className="mt-5 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Three things to try first
          </h3>
          <ol className="mt-2 space-y-2 text-sm">
            <li className="flex items-start gap-3">
              <span className="mt-0.5 rounded-md bg-gmp-purple-50 p-1.5 text-gmp-purple-700">
                <ListPlus size={14} aria-hidden="true" />
              </span>
              <span>
                <span className="font-semibold">Add a use case</span> from the Use Cases screen.
                Give it a title and at least one pillar.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 rounded-md bg-gmp-green-50 p-1.5 text-gmp-green-700">
                <BarChart3 size={14} aria-hidden="true" />
              </span>
              <span>
                <span className="font-semibold">Score it</span> on the Scoring tab. Commit to save
                and see it appear on the quadrant.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 rounded-md bg-gmp-orange-50 p-1.5 text-orange-700">
                <Grid2X2 size={14} aria-hidden="true" />
              </span>
              <span>
                <span className="font-semibold">Open the Quadrant</span> and drag a bubble to
                rescore it quickly. The popover suggests sub-score adjustments to match.
              </span>
            </li>
          </ol>

          <div className="mt-6 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={dismiss}
              className="rounded-md bg-gmp-purple px-4 py-2 text-sm font-medium text-white hover:bg-gmp-purple-700"
            >
              Got it — let me in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
