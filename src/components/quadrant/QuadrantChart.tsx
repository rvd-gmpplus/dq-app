import { useId, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import type { Pillar, Quadrant, UseCase } from '@/types/useCase';

const VB = { w: 1000, h: 720 };
const PAD = { top: 40, right: 180, bottom: 64, left: 72 };
const PLOT = {
  x: PAD.left,
  y: PAD.top,
  w: VB.w - PAD.left - PAD.right,
  h: VB.h - PAD.top - PAD.bottom,
};

export const PILLAR_COLOUR: Record<Pillar, string> = {
  Transparency: '#6859A7',
  Insight: '#38B769',
  Market: '#EA8004',
};



const QUADRANT_TINT: Record<Quadrant, string> = {
  QuickWin: '#38B769',
  Strategic: '#6859A7',
  Filler: '#EA8004',
  DontPursue: '#9CA3AF',
};

const BCG_LABEL: Record<Quadrant, string> = {
  QuickWin: 'Cash cows',
  Strategic: 'Stars',
  Filler: 'Dogs',
  DontPursue: 'Question marks',
};

// Convert score (1..5) to viewBox pixel coordinates.
function xFor(score: number): number {
  const clamped = Math.min(5, Math.max(1, score));
  return PLOT.x + ((clamped - 1) / 4) * PLOT.w;
}
function yFor(score: number): number {
  const clamped = Math.min(5, Math.max(1, score));
  // Y is inverted: high business impact is visually higher.
  return PLOT.y + (1 - (clamped - 1) / 4) * PLOT.h;
}
// Inverse: viewBox pixels back to score.
function xScore(px: number): number {
  return 1 + ((px - PLOT.x) / PLOT.w) * 4;
}
function yScore(py: number): number {
  return 1 + (1 - (py - PLOT.y) / PLOT.h) * 4;
}

function clientToViewBox(
  svg: SVGSVGElement,
  clientX: number,
  clientY: number,
): { x: number; y: number } {
  const pt = svg.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  const ctm = svg.getScreenCTM();
  if (!ctm) return { x: 0, y: 0 };
  const inv = ctm.inverse();
  const r = pt.matrixTransform(inv);
  return { x: r.x, y: r.y };
}

function bubbleRadius(uc: UseCase): number {
  return Math.max(10, Math.min(28, uc.relatedDataObjects.length * 3 + 10));
}

export type BubbleDropEvent = {
  id: string;
  targetBusiness: number;
  targetItData: number;
};

type HoverState = {
  id: string;
  x: number;
  y: number;
};

type DragState = {
  id: string;
  dx: number;
  dy: number;
};

export default function QuadrantChart({
  useCases,
  onBubbleClick,
  onBubbleDrop,
  colourBlindMode,
  selectedId,
  bcg,
}: {
  useCases: UseCase[];
  onBubbleClick: (id: string) => void;
  onBubbleDrop: (event: BubbleDropEvent) => void;
  colourBlindMode: boolean;
  selectedId?: string | null;
  bcg?: boolean;
}) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [hover, setHover] = useState<HoverState | null>(null);
  const [drag, setDrag] = useState<DragState | null>(null);

  const mid = useMemo(
    () => ({
      x: xFor(3),
      y: yFor(3),
    }),
    [],
  );

  const uid = useId().replace(/:/g, '');
  const patternIds: Record<Pillar, string> = useMemo(
    () => ({
      Transparency: `q-pt-${uid}`,
      Insight: `q-pi-${uid}`,
      Market: `q-pm-${uid}`,
    }),
    [uid],
  );

  const onPointerDown = (e: React.PointerEvent, id: string) => {
    if (e.button !== 0) return;
    (e.target as Element).setPointerCapture(e.pointerId);
    setDrag({ id, dx: 0, dy: 0 });
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag || !svgRef.current) return;
    const svg = svgRef.current;
    // Pixel delta in viewBox space
    const pt1 = clientToViewBox(svg, e.clientX - e.movementX, e.clientY - e.movementY);
    const pt2 = clientToViewBox(svg, e.clientX, e.clientY);
    setDrag((prev) =>
      prev ? { ...prev, dx: prev.dx + (pt2.x - pt1.x), dy: prev.dy + (pt2.y - pt1.y) } : prev,
    );
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (!drag || !svgRef.current) return;
    const uc = useCases.find((u) => u.id === drag.id);
    if (!uc) {
      setDrag(null);
      return;
    }
    const cx = xFor(uc.itDataImpact.score) + drag.dx;
    const cy = yFor(uc.businessImpact.score) + drag.dy;
    const targetIt = Math.min(5, Math.max(1, xScore(cx)));
    const targetBi = Math.min(5, Math.max(1, yScore(cy)));
    // Only fire drop if position actually changed beyond a small threshold
    if (Math.abs(drag.dx) + Math.abs(drag.dy) > 6) {
      onBubbleDrop({
        id: drag.id,
        targetBusiness: Math.round(targetBi * 10) / 10,
        targetItData: Math.round(targetIt * 10) / 10,
      });
    } else {
      onBubbleClick(drag.id);
    }
    setDrag(null);
    (e.target as Element).releasePointerCapture?.(e.pointerId);
  };

  const hovered = hover ? useCases.find((u) => u.id === hover.id) : null;

  return (
    <div className="relative w-full">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VB.w} ${VB.h}`}
        className="h-[720px] w-full rounded-lg border border-slate-200 bg-white"
        role="img"
        aria-label="Quadrant of scored use cases"
      >
        <defs>
          <pattern id={patternIds.Transparency} patternUnits="userSpaceOnUse" width="10" height="10">
            <rect width="10" height="10" fill={PILLAR_COLOUR.Transparency} />
            <path d="M0 10 L10 0" stroke="white" strokeWidth="2" />
            <path d="M-2 2 L2 -2" stroke="white" strokeWidth="2" />
            <path d="M8 12 L12 8" stroke="white" strokeWidth="2" />
          </pattern>
          <pattern id={patternIds.Insight} patternUnits="userSpaceOnUse" width="10" height="10">
            <rect width="10" height="10" fill={PILLAR_COLOUR.Insight} />
            <circle cx="5" cy="5" r="2" fill="white" />
          </pattern>
          <pattern id={patternIds.Market} patternUnits="userSpaceOnUse" width="10" height="10">
            <rect width="10" height="10" fill={PILLAR_COLOUR.Market} />
            <path d="M0 5 H10" stroke="white" strokeWidth="2" />
            <path d="M5 0 V10" stroke="white" strokeWidth="2" />
          </pattern>
        </defs>

        {/* Tinted quadrant backgrounds */}
        <rect
          x={PLOT.x}
          y={PLOT.y}
          width={mid.x - PLOT.x}
          height={mid.y - PLOT.y}
          fill={QUADRANT_TINT.QuickWin}
          fillOpacity={0.08}
        />
        <rect
          x={mid.x}
          y={PLOT.y}
          width={PLOT.x + PLOT.w - mid.x}
          height={mid.y - PLOT.y}
          fill={QUADRANT_TINT.Strategic}
          fillOpacity={0.08}
        />
        <rect
          x={PLOT.x}
          y={mid.y}
          width={mid.x - PLOT.x}
          height={PLOT.y + PLOT.h - mid.y}
          fill={QUADRANT_TINT.Filler}
          fillOpacity={0.08}
        />
        <rect
          x={mid.x}
          y={mid.y}
          width={PLOT.x + PLOT.w - mid.x}
          height={PLOT.y + PLOT.h - mid.y}
          fill={QUADRANT_TINT.DontPursue}
          fillOpacity={0.08}
        />

        {/* Grid: vertical lines at every integer */}
        {[1, 2, 3, 4, 5].map((x) => (
          <line
            key={`v-${x}`}
            x1={xFor(x)}
            x2={xFor(x)}
            y1={PLOT.y}
            y2={PLOT.y + PLOT.h}
            stroke={x === 1 || x === 5 ? 'var(--chart-grid-border)' : 'var(--chart-grid-minor)'}
            strokeWidth={1}
          />
        ))}
        {[1, 2, 3, 4, 5].map((y) => (
          <line
            key={`h-${y}`}
            x1={PLOT.x}
            x2={PLOT.x + PLOT.w}
            y1={yFor(y)}
            y2={yFor(y)}
            stroke={y === 1 || y === 5 ? 'var(--chart-grid-border)' : 'var(--chart-grid-minor)'}
            strokeWidth={1}
          />
        ))}

        {/* Threshold lines at 3 */}
        <line
          x1={mid.x}
          x2={mid.x}
          y1={PLOT.y}
          y2={PLOT.y + PLOT.h}
          stroke="var(--chart-threshold)"
          strokeWidth={1.5}
          strokeDasharray="4 4"
        />
        <line
          x1={PLOT.x}
          x2={PLOT.x + PLOT.w}
          y1={mid.y}
          y2={mid.y}
          stroke="var(--chart-threshold)"
          strokeWidth={1.5}
          strokeDasharray="4 4"
        />

        {/* Axis labels and ticks */}
        {[1, 2, 3, 4, 5].map((x) => (
          <text
            key={`xlbl-${x}`}
            x={xFor(x)}
            y={PLOT.y + PLOT.h + 20}
            textAnchor="middle"
            fontSize="12"
            fill="var(--chart-text)"
          >
            {x}
          </text>
        ))}
        {[1, 2, 3, 4, 5].map((y) => (
          <text
            key={`ylbl-${y}`}
            x={PLOT.x - 12}
            y={yFor(y) + 4}
            textAnchor="end"
            fontSize="12"
            fill="var(--chart-text)"
          >
            {y}
          </text>
        ))}

        {/* Axis titles */}
        <text
          x={PLOT.x + PLOT.w / 2}
          y={VB.h - 16}
          textAnchor="middle"
          fontSize="13"
          fontWeight="600"
          fill="var(--chart-axis-label)"
        >
          IT / Data difficulty (1 = easy, 5 = hard)
        </text>
        <text
          x={18}
          y={PLOT.y + PLOT.h / 2}
          textAnchor="middle"
          fontSize="13"
          fontWeight="600"
          fill="var(--chart-axis-label)"
          transform={`rotate(-90, 18, ${PLOT.y + PLOT.h / 2})`}
        >
          Business impact (1 = minimal, 5 = maximal)
        </text>

        {/* Quadrant corner labels */}
        <text
          x={PLOT.x + 16}
          y={PLOT.y + 22}
          fontSize="12"
          fontWeight="600"
          fill={QUADRANT_TINT.QuickWin}
        >
          {bcg ? BCG_LABEL.QuickWin : 'Quick wins'}
        </text>
        <text
          x={PLOT.x + PLOT.w - 16}
          y={PLOT.y + 22}
          textAnchor="end"
          fontSize="12"
          fontWeight="600"
          fill={QUADRANT_TINT.Strategic}
        >
          {bcg ? BCG_LABEL.Strategic : 'Strategic bets'}
        </text>
        <text
          x={PLOT.x + 16}
          y={PLOT.y + PLOT.h - 10}
          fontSize="12"
          fontWeight="600"
          fill={QUADRANT_TINT.Filler}
        >
          {bcg ? BCG_LABEL.Filler : 'Fillers'}
        </text>
        <text
          x={PLOT.x + PLOT.w - 16}
          y={PLOT.y + PLOT.h - 10}
          textAnchor="end"
          fontSize="12"
          fontWeight="600"
          fill={QUADRANT_TINT.DontPursue}
        >
          {bcg ? BCG_LABEL.DontPursue : "Don't pursue"}
        </text>

        {/* Bubbles */}
        <g
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={() => setHover(null)}
        >
          {useCases.map((uc) => {
            const primaryPillar = uc.pillars[0]!;
            const fill = colourBlindMode
              ? `url(#${patternIds[primaryPillar]})`
              : PILLAR_COLOUR[primaryPillar];
            const secondary = uc.pillars[1];
            const r = bubbleRadius(uc);
            const isDragging = drag?.id === uc.id;
            const cx = xFor(uc.itDataImpact.score) + (isDragging ? drag.dx : 0);
            const cy = yFor(uc.businessImpact.score) + (isDragging ? drag.dy : 0);
            const selected = uc.id === selectedId;
            return (
              <g
                key={uc.id}
                transform={`translate(${cx}, ${cy})`}
                style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
                onPointerDown={(e) => onPointerDown(e, uc.id)}
                onPointerEnter={() => setHover({ id: uc.id, x: cx, y: cy })}
                onPointerLeave={() => setHover((h) => (h?.id === uc.id ? null : h))}
              >
                <circle
                  r={r + 3}
                  fill={secondary ? PILLAR_COLOUR[secondary] : 'transparent'}
                  opacity={secondary ? 0.35 : 0}
                />
                <circle
                  r={r}
                  fill={fill}
                  stroke={selected ? '#0f172a' : 'white'}
                  strokeWidth={selected ? 3 : 2}
                  opacity={isDragging ? 0.85 : 1}
                />
                <text
                  textAnchor="middle"
                  dy="0.35em"
                  fontSize="10"
                  fontWeight="600"
                  fill="white"
                  pointerEvents="none"
                >
                  {uc.code.replace('UC-', '')}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Hover tooltip */}
      {hovered && hover && !drag && (
        <QuadrantHoverCard uc={hovered} anchorX={hover.x} anchorY={hover.y} />
      )}
    </div>
  );
}

function QuadrantHoverCard({
  uc,
  anchorX,
  anchorY,
}: {
  uc: UseCase;
  anchorX: number;
  anchorY: number;
}) {
  const xPct = (anchorX / VB.w) * 100;
  const yPct = (anchorY / VB.h) * 100;
  return (
    <div
      className={cn(
        'pointer-events-none absolute max-w-xs -translate-x-1/2 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg',
      )}
      style={{
        left: `${xPct}%`,
        top: `calc(${yPct}% + 18px)`,
      }}
    >
      <div className="flex items-center gap-2">
        <span className="font-mono text-slate-500">{uc.code}</span>
        <span className="font-medium text-slate-900">{uc.title}</span>
      </div>
      <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500">
        <span>Business {uc.businessImpact.score.toFixed(1)}</span>
        <span>&middot;</span>
        <span>IT / Data {uc.itDataImpact.score.toFixed(1)}</span>
        <span>&middot;</span>
        <span>{uc.owner}</span>
      </div>
    </div>
  );
}
