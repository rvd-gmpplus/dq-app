import { Link } from 'react-router-dom';
import QuadrantChart from '@/components/quadrant/QuadrantChart';
import type { UseCase } from '@/types/useCase';
import { useSettingsStore } from '@/stores/settingsStore';

export default function MiniQuadrant({ useCases }: { useCases: UseCase[] }) {
  const colourBlindMode = useSettingsStore((s) => s.colourBlindMode);
  const top = [...useCases]
    .sort((a, b) => b.businessImpact.score - a.businessImpact.score)
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Quadrant preview</h3>
          <p className="text-xs text-slate-500">Top five use cases by business impact.</p>
        </div>
        <Link
          to="/quadrant"
          className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-50"
        >
          Open quadrant
        </Link>
      </div>
      <div className="h-[420px]">
        <QuadrantChart
          useCases={top}
          colourBlindMode={colourBlindMode}
          onBubbleClick={() => {}}
          onBubbleDrop={() => {}}
        />
      </div>
    </div>
  );
}
