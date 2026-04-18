import { useMemo, useRef, useState } from 'react';
import { Grid2X2 } from 'lucide-react';
import { useUseCaseStore } from '@/stores/useCaseStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { filterUseCases } from '@/lib/useCaseFilters';
import { useUrlFilters } from '@/hooks/useUrlFilters';
import QuadrantChart, { type BubbleDropEvent } from '@/components/quadrant/QuadrantChart';
import QuadrantDrawer from '@/components/quadrant/QuadrantDrawer';
import QuadrantLegend from '@/components/quadrant/QuadrantLegend';
import QuadrantToolbar from '@/components/quadrant/QuadrantToolbar';
import RescorePopover from '@/components/quadrant/RescorePopover';
import EmptyState from '@/components/common/EmptyState';
import { exportQuadrantPdf, exportQuadrantPng } from '@/lib/quadrantExport';
import type { Pillar, UseCase } from '@/types/useCase';
import { PillarEnum } from '@/types/useCase';

const PILLAR_TITLE: Record<Pillar, string> = {
  Transparency: 'Transparency in the Chain',
  Insight: 'Insight-Driven Decision-Making',
  Market: 'Market Development',
};

type RescoreTarget = { ucId: string; bi: number; it: number };

export default function QuadrantPage() {
  const list = useUseCaseStore((s) => Object.values(s.items));
  const settings = useSettingsStore();
  const [filters, setFilters] = useUrlFilters();
  const [groupByPillar, setGroupByPillar] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [rescoring, setRescoring] = useState<RescoreTarget | null>(null);
  const exportRef = useRef<HTMLDivElement | null>(null);

  // Only scored use cases (status != Idea) go on the quadrant.
  const scored = useMemo(
    () => list.filter((u) => u.status !== 'Idea' && u.status !== 'Rejected'),
    [list],
  );
  const visible = useMemo(() => filterUseCases(scored, filters), [scored, filters]);

  const grouped = useMemo<Record<Pillar, UseCase[]>>(() => {
    const empty: Record<Pillar, UseCase[]> = { Transparency: [], Insight: [], Market: [] };
    for (const uc of visible) {
      for (const p of uc.pillars) empty[p].push(uc);
    }
    return empty;
  }, [visible]);

  const selected = selectedId ? list.find((u) => u.id === selectedId) ?? null : null;
  const rescoringUc = rescoring ? list.find((u) => u.id === rescoring.ucId) ?? null : null;

  const onBubbleClick = (id: string) => setSelectedId(id);
  const onBubbleDrop = (event: BubbleDropEvent) => {
    setRescoring({ ucId: event.id, bi: event.targetBusiness, it: event.targetItData });
  };

  const onExportPng = () => {
    if (exportRef.current) exportQuadrantPng(exportRef.current);
  };
  const onExportPdf = () => {
    if (exportRef.current) exportQuadrantPdf(exportRef.current);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Quadrant</h1>
          <p className="mt-1 text-sm text-slate-600">
            Business impact versus IT / Data difficulty. Click a bubble for a summary, drag to
            rescore.
          </p>
        </div>
      </div>

      <QuadrantToolbar
        filters={filters}
        onFilters={setFilters}
        bcg={settings.bcgLabels}
        onBcg={settings.setBcgLabels}
        groupByPillar={groupByPillar}
        onGroupByPillar={setGroupByPillar}
        colourBlindMode={settings.colourBlindMode}
        onColourBlindMode={settings.setColourBlindMode}
        onExportPng={onExportPng}
        onExportPdf={onExportPdf}
      />

      <div className="flex gap-5">
        <div className="flex-1" ref={exportRef}>
          {visible.length === 0 ? (
            <EmptyState
              icon={Grid2X2}
              title="No scored use cases to plot"
              description="Score a use case on both axes to see it appear on the quadrant."
            />
          ) : groupByPillar ? (
            <div className="space-y-4">
              {PillarEnum.options.map((p) => {
                const rows = grouped[p];
                if (rows.length === 0) return null;
                return (
                  <div key={p} className="rounded-lg border border-slate-200 bg-white p-4">
                    <div className="mb-2 flex items-baseline gap-3">
                      <h2 className="text-sm font-semibold text-slate-900">{PILLAR_TITLE[p]}</h2>
                      <span className="text-xs text-slate-500">{rows.length} use cases</span>
                    </div>
                    <QuadrantChart
                      useCases={rows}
                      onBubbleClick={onBubbleClick}
                      onBubbleDrop={onBubbleDrop}
                      colourBlindMode={settings.colourBlindMode}
                      selectedId={selectedId}
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <QuadrantChart
              useCases={visible}
              onBubbleClick={onBubbleClick}
              onBubbleDrop={onBubbleDrop}
              colourBlindMode={settings.colourBlindMode}
              selectedId={selectedId}
            />
          )}
        </div>

        <QuadrantLegend bcg={settings.bcgLabels} useCases={visible} />
      </div>

      <QuadrantDrawer uc={selected} onClose={() => setSelectedId(null)} />

      {rescoringUc && rescoring && (
        <RescorePopover
          uc={rescoringUc}
          targetBusiness={rescoring.bi}
          targetItData={rescoring.it}
          onClose={() => setRescoring(null)}
        />
      )}
    </div>
  );
}
