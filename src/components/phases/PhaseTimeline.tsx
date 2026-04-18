import { parseISO, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { fmtDate } from '@/lib/dates';
import type { Phase } from '@/types/phase';

const ROW_HEIGHT = 48;
const ROW_PADDING = 10;
const LABEL_WIDTH = 160;
const TIMELINE_HEIGHT = 14;
const HEADER_HEIGHT = 32;
const FOOTER_HEIGHT = 20;

const STATUS_COLOUR: Record<Phase['status'], string> = {
  Completed: '#38B769',
  'In Progress': '#6859A7',
  Delayed: '#EA8004',
  'Not Started': '#CBD5E1',
};

function addMonths(d: Date, n: number): Date {
  const out = new Date(d);
  out.setMonth(out.getMonth() + n);
  return out;
}

export default function PhaseTimeline({ phases }: { phases: Phase[] }) {
  if (phases.length === 0) return null;

  const now = new Date();

  const allDates = phases.flatMap((p) => {
    const out = [parseISO(p.plannedStart), parseISO(p.plannedEnd)];
    if (p.actualStart) out.push(parseISO(p.actualStart));
    if (p.actualEnd) out.push(parseISO(p.actualEnd));
    return out;
  });
  allDates.push(now);

  const minDate = new Date(Math.min(...allDates.map((d) => d.getTime())));
  const maxDate = new Date(Math.max(...allDates.map((d) => d.getTime())));
  // Pad either side for breathing room
  const padStart = addMonths(minDate, -1);
  const padEnd = addMonths(maxDate, 1);
  const totalDays = Math.max(1, differenceInDays(padEnd, padStart));

  const svgWidth = 1200;
  const plotWidth = svgWidth - LABEL_WIDTH - 16;

  const xFor = (iso: string) => {
    const d = parseISO(iso);
    return LABEL_WIDTH + (differenceInDays(d, padStart) / totalDays) * plotWidth;
  };
  const xForDate = (d: Date) =>
    LABEL_WIDTH + (differenceInDays(d, padStart) / totalDays) * plotWidth;

  const svgHeight = HEADER_HEIGHT + phases.length * ROW_HEIGHT + FOOTER_HEIGHT;

  // Month ticks
  const months: Date[] = [];
  for (let d = new Date(padStart); d <= padEnd; d = addMonths(d, 1)) {
    months.push(new Date(d));
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white p-3">
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="h-[360px] w-full min-w-[900px]"
        role="img"
        aria-label="Phase timeline"
      >
        {/* Month ticks */}
        {months.map((m) => {
          const x = xForDate(m);
          const isQuarterStart = m.getMonth() % 3 === 0;
          return (
            <g key={m.toISOString()}>
              <line
                x1={x}
                y1={HEADER_HEIGHT}
                x2={x}
                y2={svgHeight - FOOTER_HEIGHT}
                stroke={isQuarterStart ? '#cbd5e1' : '#f1f5f9'}
                strokeWidth={1}
              />
              {isQuarterStart && (
                <text x={x} y={HEADER_HEIGHT - 8} textAnchor="middle" fontSize="10" fill="#64748b">
                  {m.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                </text>
              )}
            </g>
          );
        })}

        {/* NOW marker */}
        {xForDate(now) >= LABEL_WIDTH && xForDate(now) <= svgWidth && (
          <g>
            <line
              x1={xForDate(now)}
              x2={xForDate(now)}
              y1={HEADER_HEIGHT - 4}
              y2={svgHeight - FOOTER_HEIGHT + 2}
              stroke="#E11D48"
              strokeWidth={1.5}
              strokeDasharray="3 3"
            />
            <rect
              x={xForDate(now) - 18}
              y={svgHeight - FOOTER_HEIGHT + 2}
              width={36}
              height={14}
              rx={3}
              fill="#E11D48"
            />
            <text
              x={xForDate(now)}
              y={svgHeight - FOOTER_HEIGHT + 12}
              textAnchor="middle"
              fontSize="9"
              fill="white"
              fontWeight="bold"
            >
              NOW
            </text>
          </g>
        )}

        {/* Phase rows */}
        {phases.map((phase, idx) => {
          const rowY = HEADER_HEIGHT + idx * ROW_HEIGHT;
          const plannedX1 = xFor(phase.plannedStart);
          const plannedX2 = xFor(phase.plannedEnd);
          const actualX1 = phase.actualStart ? xFor(phase.actualStart) : null;
          const actualEnd = phase.actualEnd ?? (phase.status === 'In Progress' || phase.status === 'Delayed' ? now.toISOString() : null);
          const actualX2 = actualEnd ? xFor(actualEnd) : null;
          const isDelayed = phase.status === 'Delayed';

          return (
            <g key={phase.id}>
              <text
                x={LABEL_WIDTH - 12}
                y={rowY + ROW_HEIGHT / 2 - 4}
                textAnchor="end"
                fontSize="12"
                fontWeight="600"
                fill="#334155"
              >
                {phase.id}. {phase.name}
              </text>
              <text
                x={LABEL_WIDTH - 12}
                y={rowY + ROW_HEIGHT / 2 + 10}
                textAnchor="end"
                fontSize="10"
                fill={STATUS_COLOUR[phase.status]}
              >
                {phase.status}
              </text>

              {/* Planned bar */}
              <rect
                x={plannedX1}
                y={rowY + ROW_PADDING}
                width={Math.max(2, plannedX2 - plannedX1)}
                height={TIMELINE_HEIGHT}
                fill="#DED8EE"
                rx={3}
              />
              {/* Actual bar */}
              {actualX1 !== null && actualX2 !== null && (
                <rect
                  x={actualX1}
                  y={rowY + ROW_PADDING + TIMELINE_HEIGHT + 2}
                  width={Math.max(2, actualX2 - actualX1)}
                  height={TIMELINE_HEIGHT}
                  fill={STATUS_COLOUR[phase.status]}
                  rx={3}
                />
              )}
              {/* Delay tag */}
              {isDelayed && actualX1 !== null && (
                <text
                  x={(actualX1 + (actualX2 ?? actualX1)) / 2}
                  y={rowY + ROW_PADDING + TIMELINE_HEIGHT + 2 + TIMELINE_HEIGHT - 3}
                  textAnchor="middle"
                  fontSize="9"
                  fill="white"
                  fontWeight="bold"
                >
                  delayed
                </text>
              )}
            </g>
          );
        })}
      </svg>

      <div className="mt-2 flex items-center justify-end gap-4 text-[11px] text-slate-500">
        <span className="inline-flex items-center gap-1">
          <span className={cn('h-2 w-4 rounded-sm bg-gmp-purple-100')} />
          Planned
        </span>
        <span className="inline-flex items-center gap-1">
          <span className={cn('h-2 w-4 rounded-sm bg-gmp-purple')} />
          Actual / in progress
        </span>
        <span className="inline-flex items-center gap-1">
          <span className={cn('h-2 w-4 rounded-sm bg-gmp-green')} />
          Completed
        </span>
        <span className="inline-flex items-center gap-1">
          <span className={cn('h-2 w-4 rounded-sm bg-gmp-orange')} />
          Delayed
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-3 w-px bg-rose-500" />
          NOW ({fmtDate(new Date().toISOString())})
        </span>
      </div>
    </div>
  );
}
