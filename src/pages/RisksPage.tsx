import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import EmptyState from '@/components/common/EmptyState';
import RiskHeatmap from '@/components/risks/RiskHeatmap';
import RiskRegister from '@/components/risks/RiskRegister';
import { useRiskStore } from '@/stores/riskStore';

export default function RisksPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const risks = useRiskStore((s) => Object.values(s.items));
  const create = useRiskStore((s) => s.create);

  const onAddFirst = () => {
    const fresh = create({
      title: 'New risk',
      likelihood: 3,
      impact: 3,
      mitigation: '',
      owner: 'Mirella van der Kleij',
      status: 'Open',
    });
    setSelected(fresh.id);
  };

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-xl font-semibold text-slate-900">Risks</h1>
        <p className="mt-1 text-sm text-slate-600">
          Likelihood × impact heatmap and the underlying risk register.
        </p>
      </header>

      {risks.length === 0 ? (
        <EmptyState
          icon={AlertTriangle}
          title="No risks captured yet"
          description="Add the first risk to plot it on the heatmap and track its mitigation."
          action={{ label: 'Add the first risk', onClick: onAddFirst }}
        />
      ) : (
        <>
          <RiskHeatmap onSelect={setSelected} selected={selected} />
          <RiskRegister selected={selected} onSelect={setSelected} />
        </>
      )}
    </div>
  );
}
