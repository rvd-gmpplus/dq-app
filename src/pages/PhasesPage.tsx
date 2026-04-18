import { usePhaseStore } from '@/stores/phaseStore';
import PhaseTimeline from '@/components/phases/PhaseTimeline';
import PhaseAccordion from '@/components/phases/PhaseAccordion';

export default function PhasesPage() {
  const phases = usePhaseStore((s) => [...s.items].sort((a, b) => a.id - b.id));

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-xl font-semibold text-slate-900">Phases</h1>
        <p className="mt-1 text-sm text-slate-600">
          Planned versus actual across the five phases of the Data Quality Project.
        </p>
      </header>

      <PhaseTimeline phases={phases} />

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-900">Phase detail</h2>
        {phases.map((p) => (
          <PhaseAccordion key={p.id} phase={p} />
        ))}
      </section>
    </div>
  );
}
