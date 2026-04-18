import { Link } from 'react-router-dom';
import { useRiskStore } from '@/stores/riskStore';
import type { Risk } from '@/types/risk';

function cellColour(score: number): string {
  if (score <= 4) return '#E6F7EE';
  if (score <= 9) return '#FEF3C7';
  if (score <= 15) return '#FED7AA';
  if (score <= 20) return '#FCA5A5';
  return '#F87171';
}

function cellBorder(score: number): string {
  if (score <= 4) return '#BBF7D0';
  if (score <= 9) return '#FDE68A';
  if (score <= 15) return '#FDBA74';
  return '#F87171';
}

const CELL = 80;
const LABEL_W = 48;
const LABEL_H = 28;

export default function RiskHeatmap({
  onSelect,
  selected,
}: {
  onSelect: (id: string) => void;
  selected?: string | null;
}) {
  const risks = useRiskStore((s) => Object.values(s.items));

  const byCell: Record<string, Risk[]> = {};
  for (const r of risks) {
    const key = `${r.likelihood}:${r.impact}`;
    if (!byCell[key]) byCell[key] = [];
    byCell[key].push(r);
  }

  const size = {
    w: LABEL_W + CELL * 5 + 16,
    h: LABEL_H + CELL * 5 + 40,
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Risk heatmap</h2>
          <p className="text-xs text-slate-500">Likelihood × impact, each cell coloured by score.</p>
        </div>
        <Link to="#register" className="text-xs text-slate-500 hover:text-gmp-purple-700">
          Register &darr;
        </Link>
      </div>
      <div className="mt-3 overflow-x-auto">
        <svg viewBox={`0 0 ${size.w} ${size.h}`} className="h-[440px] w-full">
          {/* Top axis: impact labels */}
          {[1, 2, 3, 4, 5].map((impact) => (
            <text
              key={`impact-${impact}`}
              x={LABEL_W + (impact - 1) * CELL + CELL / 2}
              y={LABEL_H - 10}
              textAnchor="middle"
              fontSize="12"
              fontWeight="600"
              fill="#475569"
            >
              {impact}
            </text>
          ))}
          <text
            x={LABEL_W + (CELL * 5) / 2}
            y={LABEL_H + CELL * 5 + 30}
            textAnchor="middle"
            fontSize="11"
            fontWeight="600"
            fill="#334155"
          >
            Impact →
          </text>
          {/* Left axis: likelihood labels (top is 5, bottom is 1) */}
          {[5, 4, 3, 2, 1].map((likelihood, row) => (
            <text
              key={`like-${likelihood}`}
              x={LABEL_W - 12}
              y={LABEL_H + row * CELL + CELL / 2 + 4}
              textAnchor="end"
              fontSize="12"
              fontWeight="600"
              fill="#475569"
            >
              {likelihood}
            </text>
          ))}
          <text
            x={12}
            y={LABEL_H + (CELL * 5) / 2}
            textAnchor="middle"
            fontSize="11"
            fontWeight="600"
            fill="#334155"
            transform={`rotate(-90, 12, ${LABEL_H + (CELL * 5) / 2})`}
          >
            ↑ Likelihood
          </text>

          {/* Cells */}
          {[5, 4, 3, 2, 1].map((likelihood, row) =>
            [1, 2, 3, 4, 5].map((impact, col) => {
              const score = likelihood * impact;
              const key = `${likelihood}:${impact}`;
              const cellRisks = byCell[key] ?? [];
              const x = LABEL_W + col * CELL;
              const y = LABEL_H + row * CELL;
              return (
                <g key={key}>
                  <rect
                    x={x}
                    y={y}
                    width={CELL}
                    height={CELL}
                    fill={cellColour(score)}
                    stroke={cellBorder(score)}
                    strokeWidth={1}
                  />
                  <text
                    x={x + 6}
                    y={y + 12}
                    fontSize="9"
                    fill="#64748b"
                  >
                    {score}
                  </text>
                  {cellRisks.map((r, idx) => {
                    const cx = x + CELL / 2 + ((idx % 3) - 1) * 18;
                    const cy = y + CELL / 2 + Math.floor(idx / 3) * 18;
                    const sel = r.id === selected;
                    return (
                      <g key={r.id} style={{ cursor: 'pointer' }} onClick={() => onSelect(r.id)}>
                        <circle
                          cx={cx}
                          cy={cy}
                          r={13}
                          fill="#6859A7"
                          stroke={sel ? '#0f172a' : 'white'}
                          strokeWidth={sel ? 2 : 1.5}
                        />
                        <text
                          x={cx}
                          y={cy + 4}
                          textAnchor="middle"
                          fontSize="9"
                          fontWeight="600"
                          fill="white"
                        >
                          {r.title.slice(0, 2).toUpperCase()}
                        </text>
                      </g>
                    );
                  })}
                </g>
              );
            }),
          )}
        </svg>
      </div>
    </div>
  );
}
