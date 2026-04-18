import { useState } from 'react';
import RiskHeatmap from '@/components/risks/RiskHeatmap';
import RiskRegister from '@/components/risks/RiskRegister';

export default function RisksPage() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-xl font-semibold text-slate-900">Risks</h1>
        <p className="mt-1 text-sm text-slate-600">
          Likelihood × impact heatmap and the underlying risk register.
        </p>
      </header>

      <RiskHeatmap onSelect={setSelected} selected={selected} />
      <RiskRegister selected={selected} onSelect={setSelected} />
    </div>
  );
}
