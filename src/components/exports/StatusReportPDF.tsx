import {
  Document,
  Page,
  Path,
  Rect,
  StyleSheet,
  Svg,
  Text,
  View,
  Circle,
  Line,
  G,
  Text as SvgText,
} from '@react-pdf/renderer';
import type { Phase } from '@/types/phase';
import type { Risk } from '@/types/risk';
import type { UseCase, Quadrant } from '@/types/useCase';

// A4 landscape @ 72dpi: 842 x 595
const PAGE = { w: 842, h: 595 };

const COLOUR = {
  purple: '#6859A7',
  green: '#38B769',
  orange: '#EA8004',
  grey: '#9CA3AF',
  slate900: '#0F172A',
  slate700: '#334155',
  slate500: '#64748B',
  slate300: '#CBD5E1',
  slate200: '#E2E8F0',
  slate100: '#F1F5F9',
  slate50: '#F8FAFC',
  rose: '#E11D48',
  white: '#FFFFFF',
};

const QUADRANT_COLOUR: Record<Quadrant, string> = {
  QuickWin: COLOUR.green,
  Strategic: COLOUR.purple,
  Filler: COLOUR.orange,
  DontPursue: COLOUR.grey,
};

const QUADRANT_LABEL: Record<Quadrant, string> = {
  QuickWin: 'Quick wins',
  Strategic: 'Strategic bets',
  Filler: 'Fillers',
  DontPursue: "Don't pursue",
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 36,
    paddingLeft: 36,
    paddingRight: 36,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: COLOUR.slate700,
    backgroundColor: COLOUR.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderBottomWidth: 1,
    borderBottomColor: COLOUR.slate200,
    paddingBottom: 8,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: COLOUR.slate900,
  },
  headerSub: {
    fontSize: 9,
    color: COLOUR.slate500,
  },
  pageNumber: {
    fontSize: 9,
    color: COLOUR.slate500,
  },
  h1: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: COLOUR.slate900,
    marginBottom: 4,
  },
  h2: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: COLOUR.slate900,
    marginTop: 14,
    marginBottom: 6,
  },
  lead: {
    fontSize: 10,
    color: COLOUR.slate700,
    marginBottom: 10,
    lineHeight: 1.5,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  kpiCell: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLOUR.slate200,
    borderRadius: 4,
    padding: 10,
    backgroundColor: COLOUR.slate50,
  },
  kpiLabel: {
    fontSize: 8,
    textTransform: 'uppercase',
    color: COLOUR.slate500,
    marginBottom: 3,
    letterSpacing: 0.6,
  },
  kpiValue: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: COLOUR.slate900,
  },
  kpiHint: {
    fontSize: 8,
    color: COLOUR.slate500,
    marginTop: 2,
  },
  table: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: COLOUR.slate200,
    borderRadius: 4,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLOUR.slate50,
    borderBottomWidth: 1,
    borderBottomColor: COLOUR.slate200,
    padding: 6,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLOUR.slate100,
  },
  tableRowLast: {
    flexDirection: 'row',
    padding: 6,
  },
  th: {
    fontSize: 8,
    textTransform: 'uppercase',
    color: COLOUR.slate500,
    letterSpacing: 0.6,
  },
  td: {
    fontSize: 10,
    color: COLOUR.slate700,
  },
  tdBold: {
    fontSize: 10,
    color: COLOUR.slate900,
    fontFamily: 'Helvetica-Bold',
  },
  caption: {
    fontSize: 8,
    color: COLOUR.slate500,
    marginTop: 4,
  },
  phasePlanned: {
    height: 10,
    backgroundColor: '#DED8EE',
    borderRadius: 2,
  },
});

function pageHeader(periodLabel: string, author: string, pageNum: string) {
  return (
    <View style={styles.header} fixed>
      <View>
        <Text style={styles.headerTitle}>GMP+ Data Quality Project — Status</Text>
        <Text style={styles.headerSub}>
          {periodLabel} · {author}
        </Text>
      </View>
      <Text style={styles.pageNumber}>{pageNum}</Text>
    </View>
  );
}

function currentPeriodLabel(): string {
  const d = new Date();
  const year = d.getFullYear();
  // ISO week of the year
  const onejan = new Date(year, 0, 1);
  const week = Math.ceil(((d.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7);
  return `Status week ${String(week).padStart(2, '0')} · ${year}`;
}

function QuadrantDistributionBar({ useCases }: { useCases: UseCase[] }) {
  const scored = useCases.filter((u) => u.status !== 'Idea' && u.status !== 'Rejected');
  const counts: Record<Quadrant, number> = {
    QuickWin: 0,
    Strategic: 0,
    Filler: 0,
    DontPursue: 0,
  };
  for (const u of scored) counts[u.quadrant] += 1;
  const total = Math.max(1, scored.length);
  const W = 480;
  const H = 14;
  let offset = 0;
  const segments: { q: Quadrant; x: number; w: number; count: number }[] = [];
  for (const q of ['QuickWin', 'Strategic', 'Filler', 'DontPursue'] as Quadrant[]) {
    const w = (counts[q] / total) * W;
    segments.push({ q, x: offset, w, count: counts[q] });
    offset += w;
  }
  return (
    <View>
      <Text style={styles.h2}>Quadrant distribution</Text>
      <Svg width={W} height={H + 26}>
        {segments.map((s, i) => (
          <G key={s.q}>
            <Rect
              x={s.x}
              y={0}
              width={Math.max(0, s.w)}
              height={H}
              fill={QUADRANT_COLOUR[s.q]}
            />
            <SvgText
              x={s.x + s.w / 2}
              y={H + 12}
              style={{ fontSize: 8, fill: COLOUR.slate700 }}
            >
              {`${QUADRANT_LABEL[s.q]} (${s.count})`}
            </SvgText>
            <SvgText
              x={s.x + 6}
              y={H - 3}
              style={{ fontSize: 8, fill: i === 3 ? COLOUR.slate900 : COLOUR.white }}
            >
              {s.count > 0 ? String(s.count) : ''}
            </SvgText>
          </G>
        ))}
      </Svg>
    </View>
  );
}

function QuadrantScatter({ useCases }: { useCases: UseCase[] }) {
  const W = PAGE.w - 72;
  const H = 440;
  const padLeft = 56;
  const padRight = 16;
  const padTop = 24;
  const padBottom = 40;
  const plotW = W - padLeft - padRight;
  const plotH = H - padTop - padBottom;
  const xFor = (s: number) => padLeft + ((s - 1) / 4) * plotW;
  const yFor = (s: number) => padTop + (1 - (s - 1) / 4) * plotH;
  const mx = xFor(3.5);
  const my = yFor(3.5);
  const scored = useCases.filter((u) => u.status !== 'Idea' && u.status !== 'Rejected');

  return (
    <Svg width={W} height={H}>
      {/* Quadrant tints */}
      <Rect x={padLeft} y={padTop} width={mx - padLeft} height={my - padTop} fill={COLOUR.green} fillOpacity={0.08} />
      <Rect x={mx} y={padTop} width={padLeft + plotW - mx} height={my - padTop} fill={COLOUR.purple} fillOpacity={0.08} />
      <Rect x={padLeft} y={my} width={mx - padLeft} height={padTop + plotH - my} fill={COLOUR.orange} fillOpacity={0.08} />
      <Rect x={mx} y={my} width={padLeft + plotW - mx} height={padTop + plotH - my} fill={COLOUR.grey} fillOpacity={0.08} />

      {/* Gridlines */}
      {[1, 2, 3, 4, 5].map((i) => (
        <G key={i}>
          <Line x1={xFor(i)} y1={padTop} x2={xFor(i)} y2={padTop + plotH} stroke={COLOUR.slate200} strokeWidth={0.5} />
          <Line x1={padLeft} y1={yFor(i)} x2={padLeft + plotW} y2={yFor(i)} stroke={COLOUR.slate200} strokeWidth={0.5} />
          <SvgText x={xFor(i)} y={padTop + plotH + 14} style={{ fontSize: 8, fill: COLOUR.slate500, textAnchor: 'middle' }}>{String(i)}</SvgText>
          <SvgText x={padLeft - 8} y={yFor(i) + 3} style={{ fontSize: 8, fill: COLOUR.slate500, textAnchor: 'end' }}>{String(i)}</SvgText>
        </G>
      ))}
      {/* Threshold lines */}
      <Line x1={mx} y1={padTop} x2={mx} y2={padTop + plotH} stroke={COLOUR.slate500} strokeWidth={0.8} strokeDasharray="4 4" />
      <Line x1={padLeft} y1={my} x2={padLeft + plotW} y2={my} stroke={COLOUR.slate500} strokeWidth={0.8} strokeDasharray="4 4" />

      {/* Axis titles */}
      <SvgText x={padLeft + plotW / 2} y={H - 8} style={{ fontSize: 9, fill: COLOUR.slate700, textAnchor: 'middle' }}>
        IT / Data difficulty (1 = easy, 5 = hard)
      </SvgText>
      <SvgText x={16} y={padTop + plotH / 2} style={{ fontSize: 9, fill: COLOUR.slate700, textAnchor: 'middle' }} transform={`rotate(-90, 16, ${padTop + plotH / 2})`}>
        Business impact (1 = minimal, 5 = maximal)
      </SvgText>

      {/* Corner labels */}
      <SvgText x={padLeft + 6} y={padTop + 12} style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', fill: COLOUR.green }}>Quick wins</SvgText>
      <SvgText x={padLeft + plotW - 6} y={padTop + 12} style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', fill: COLOUR.purple, textAnchor: 'end' }}>Strategic bets</SvgText>
      <SvgText x={padLeft + 6} y={padTop + plotH - 4} style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', fill: COLOUR.orange }}>Fillers</SvgText>
      <SvgText x={padLeft + plotW - 6} y={padTop + plotH - 4} style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', fill: COLOUR.grey, textAnchor: 'end' }}>Don't pursue</SvgText>

      {/* Bubbles */}
      {scored.map((uc) => {
        const x = xFor(uc.itDataImpact.score);
        const y = yFor(uc.businessImpact.score);
        const fill = uc.pillars[0] === 'Insight' ? COLOUR.green : uc.pillars[0] === 'Market' ? COLOUR.orange : COLOUR.purple;
        return (
          <G key={uc.id}>
            <Circle cx={x} cy={y} r={9} fill={fill} stroke={COLOUR.white} strokeWidth={1.5} />
            <SvgText x={x} y={y + 3} style={{ fontSize: 6, fill: COLOUR.white, textAnchor: 'middle', fontFamily: 'Helvetica-Bold' }}>
              {uc.code.replace('UC-', '')}
            </SvgText>
          </G>
        );
      })}
    </Svg>
  );
}

function RiskHeatmapPdf({ risks }: { risks: Risk[] }) {
  const cellSize = 42;
  const labelW = 26;
  const labelH = 18;
  const W = labelW + cellSize * 5 + 10;
  const H = labelH + cellSize * 5 + 30;
  const byCell: Record<string, Risk[]> = {};
  for (const r of risks) {
    const k = `${r.likelihood}:${r.impact}`;
    if (!byCell[k]) byCell[k] = [];
    byCell[k].push(r);
  }
  const colour = (score: number) => {
    if (score <= 4) return '#E6F7EE';
    if (score <= 9) return '#FEF3C7';
    if (score <= 15) return '#FED7AA';
    if (score <= 20) return '#FCA5A5';
    return '#F87171';
  };
  return (
    <Svg width={W} height={H}>
      {[1, 2, 3, 4, 5].map((impact) => (
        <SvgText key={`i-${impact}`} x={labelW + (impact - 1) * cellSize + cellSize / 2} y={labelH - 6} style={{ fontSize: 8, fill: COLOUR.slate700, textAnchor: 'middle' }}>
          {impact}
        </SvgText>
      ))}
      <SvgText x={labelW + (cellSize * 5) / 2} y={labelH + cellSize * 5 + 16} style={{ fontSize: 8, fill: COLOUR.slate700, textAnchor: 'middle' }}>Impact →</SvgText>
      {[5, 4, 3, 2, 1].map((likelihood, row) => (
        <SvgText key={`l-${likelihood}`} x={labelW - 4} y={labelH + row * cellSize + cellSize / 2 + 3} style={{ fontSize: 8, fill: COLOUR.slate700, textAnchor: 'end' }}>
          {likelihood}
        </SvgText>
      ))}
      {[5, 4, 3, 2, 1].map((likelihood, row) =>
        [1, 2, 3, 4, 5].map((impact, col) => {
          const score = likelihood * impact;
          const key = `${likelihood}:${impact}`;
          const cellRisks = byCell[key] ?? [];
          const x = labelW + col * cellSize;
          const y = labelH + row * cellSize;
          return (
            <G key={key}>
              <Rect x={x} y={y} width={cellSize} height={cellSize} fill={colour(score)} stroke={COLOUR.slate200} strokeWidth={0.5} />
              <SvgText x={x + 3} y={y + 8} style={{ fontSize: 6, fill: COLOUR.slate500 }}>{String(score)}</SvgText>
              {cellRisks.map((_r, idx) => (
                <Circle key={idx} cx={x + cellSize / 2 + ((idx % 3) - 1) * 10} cy={y + cellSize / 2 + Math.floor(idx / 3) * 10} r={5} fill={COLOUR.purple} stroke={COLOUR.white} strokeWidth={1} />
              ))}
            </G>
          );
        }),
      )}
    </Svg>
  );
}

function PhaseStripe({ phases, width }: { phases: Phase[]; width: number }) {
  if (phases.length === 0) return null;
  const sorted = [...phases].sort((a, b) => a.id - b.id);
  const allDates: Date[] = [];
  for (const p of sorted) {
    allDates.push(new Date(p.plannedStart), new Date(p.plannedEnd));
    if (p.actualStart) allDates.push(new Date(p.actualStart));
    if (p.actualEnd) allDates.push(new Date(p.actualEnd));
  }
  allDates.push(new Date());
  const min = new Date(Math.min(...allDates.map((d) => d.getTime())));
  const max = new Date(Math.max(...allDates.map((d) => d.getTime())));
  const totalMs = Math.max(1, max.getTime() - min.getTime());
  const x = (iso: string) => ((new Date(iso).getTime() - min.getTime()) / totalMs) * width;

  const rowH = 18;
  const H = sorted.length * rowH + 20;
  const nowX = ((Date.now() - min.getTime()) / totalMs) * width;
  const labelW = 100;
  return (
    <Svg width={labelW + width} height={H}>
      {sorted.map((p, i) => {
        const y = i * rowH + 6;
        const plannedX1 = labelW + x(p.plannedStart);
        const plannedX2 = labelW + x(p.plannedEnd);
        const actualX1 = p.actualStart ? labelW + x(p.actualStart) : null;
        const actualEnd = p.actualEnd ?? (p.status === 'In Progress' || p.status === 'Delayed' ? new Date().toISOString() : null);
        const actualX2 = actualEnd ? labelW + x(actualEnd) : null;
        const actualFill =
          p.status === 'Completed' ? COLOUR.green : p.status === 'Delayed' ? COLOUR.orange : p.status === 'In Progress' ? COLOUR.purple : COLOUR.slate300;
        return (
          <G key={p.id}>
            <SvgText x={labelW - 6} y={y + 10} style={{ fontSize: 9, fill: COLOUR.slate700, textAnchor: 'end' }}>
              {`${p.id}. ${p.name}`}
            </SvgText>
            <Rect x={plannedX1} y={y + 2} width={Math.max(2, plannedX2 - plannedX1)} height={5} fill="#DED8EE" />
            {actualX1 !== null && actualX2 !== null && (
              <Rect x={actualX1} y={y + 8} width={Math.max(2, actualX2 - actualX1)} height={5} fill={actualFill} />
            )}
          </G>
        );
      })}
      <Line x1={labelW + nowX} y1={0} x2={labelW + nowX} y2={H - 14} stroke={COLOUR.rose} strokeWidth={1} strokeDasharray="2 2" />
      <SvgText x={labelW + nowX} y={H - 4} style={{ fontSize: 7, fill: COLOUR.rose, textAnchor: 'middle', fontFamily: 'Helvetica-Bold' }}>NOW</SvgText>
    </Svg>
  );
}

export type StatusReportData = {
  useCases: UseCase[];
  phases: Phase[];
  risks: Risk[];
  author: string;
  periodLabel?: string;
};

export default function StatusReportPDF({
  useCases,
  phases,
  risks,
  author,
  periodLabel,
}: StatusReportData) {
  const period = periodLabel ?? currentPeriodLabel();
  const scored = useCases.filter((u) => u.status !== 'Idea' && u.status !== 'Rejected');
  const quickWins = scored.filter((u) => u.quadrant === 'QuickWin');
  const currentPhase =
    phases.find((p) => p.status === 'In Progress' || p.status === 'Delayed') ?? phases[0];
  const topFive = [...scored]
    .sort((a, b) => b.businessImpact.score - a.businessImpact.score)
    .slice(0, 5);
  const openRisks = risks
    .filter((r) => r.status === 'Open' || r.status === 'Monitoring')
    .sort((a, b) => b.score - a.score);

  return (
    <Document
      title={`GMP+ DQ Status — ${period}`}
      author={author}
      creator="GMP+ DQ app"
      producer="GMP+ DQ app"
    >
      {/* Page 1: executive summary */}
      <Page size="A4" orientation="landscape" style={styles.page} wrap={false}>
        {pageHeader(period, author, '1 / 5')}
        <Text style={styles.h1}>Executive summary</Text>
        <Text style={styles.lead}>
          The Data Quality Project currently tracks {useCases.length} use cases. {scored.length}
          {' '}are scored and plotted on the quadrant. {quickWins.length} fall in the Quick Wins
          quadrant and can be delivered against the current architecture.{' '}
          {currentPhase ? `Active phase: ${currentPhase.name} (${currentPhase.status}).` : ''}
        </Text>

        <View style={styles.kpiRow}>
          <View style={styles.kpiCell}>
            <Text style={styles.kpiLabel}>Use cases</Text>
            <Text style={styles.kpiValue}>{String(useCases.length)}</Text>
            <Text style={styles.kpiHint}>{`${scored.length} scored`}</Text>
          </View>
          <View style={styles.kpiCell}>
            <Text style={styles.kpiLabel}>Quick wins</Text>
            <Text style={styles.kpiValue}>{String(quickWins.length)}</Text>
            <Text style={styles.kpiHint}>High business, low IT</Text>
          </View>
          <View style={styles.kpiCell}>
            <Text style={styles.kpiLabel}>Open risks</Text>
            <Text style={styles.kpiValue}>{String(openRisks.length)}</Text>
            <Text style={styles.kpiHint}>{`${risks.length} total`}</Text>
          </View>
          <View style={styles.kpiCell}>
            <Text style={styles.kpiLabel}>Current phase</Text>
            <Text style={styles.kpiValue}>{currentPhase?.name ?? '—'}</Text>
            <Text style={styles.kpiHint}>{currentPhase?.status ?? ''}</Text>
          </View>
        </View>

        <QuadrantDistributionBar useCases={useCases} />

        <Text style={styles.h2}>Top Quick Wins this quarter</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, { width: 60 }]}>Code</Text>
            <Text style={[styles.th, { flex: 1 }]}>Title</Text>
            <Text style={[styles.th, { width: 110 }]}>Owner</Text>
            <Text style={[styles.th, { width: 60, textAlign: 'right' }]}>BI / IT</Text>
          </View>
          {[...quickWins]
            .sort((a, b) => b.businessImpact.score - a.businessImpact.score)
            .slice(0, 5)
            .map((uc, i, arr) => (
              <View key={uc.id} style={i === arr.length - 1 ? styles.tableRowLast : styles.tableRow}>
                <Text style={[styles.td, { width: 60 }]}>{uc.code}</Text>
                <Text style={[styles.tdBold, { flex: 1 }]}>{uc.title}</Text>
                <Text style={[styles.td, { width: 110 }]}>{uc.owner}</Text>
                <Text style={[styles.td, { width: 60, textAlign: 'right' }]}>
                  {uc.businessImpact.score.toFixed(1)} / {uc.itDataImpact.score.toFixed(1)}
                </Text>
              </View>
            ))}
        </View>
      </Page>

      {/* Page 2: quadrant */}
      <Page size="A4" orientation="landscape" style={styles.page} wrap={false}>
        {pageHeader(period, author, '2 / 5')}
        <Text style={styles.h1}>Quadrant</Text>
        <Text style={styles.lead}>
          Every scored use case plotted by business impact and IT / Data difficulty. Bubbles are
          coloured by the primary pillar (purple = Transparency, green = Insight, orange = Market).
        </Text>
        <QuadrantScatter useCases={useCases} />
      </Page>

      {/* Page 3: top five use cases */}
      <Page size="A4" orientation="landscape" style={styles.page} wrap={false}>
        {pageHeader(period, author, '3 / 5')}
        <Text style={styles.h1}>Top five use cases</Text>
        <Text style={styles.lead}>
          Ranked by business impact. Use these as the anchor conversation when briefing MT on
          Friday.
        </Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, { width: 50 }]}>Code</Text>
            <Text style={[styles.th, { flex: 1 }]}>Title</Text>
            <Text style={[styles.th, { width: 100 }]}>Quadrant</Text>
            <Text style={[styles.th, { width: 120 }]}>Owner</Text>
            <Text style={[styles.th, { width: 60, textAlign: 'right' }]}>BI</Text>
            <Text style={[styles.th, { width: 60, textAlign: 'right' }]}>IT</Text>
            <Text style={[styles.th, { width: 70 }]}>Status</Text>
          </View>
          {topFive.map((uc, i, arr) => (
            <View key={uc.id} style={i === arr.length - 1 ? styles.tableRowLast : styles.tableRow}>
              <Text style={[styles.td, { width: 50 }]}>{uc.code}</Text>
              <Text style={[styles.tdBold, { flex: 1 }]}>{uc.title}</Text>
              <Text style={[styles.td, { width: 100, color: QUADRANT_COLOUR[uc.quadrant] }]}>
                {QUADRANT_LABEL[uc.quadrant]}
              </Text>
              <Text style={[styles.td, { width: 120 }]}>{uc.owner}</Text>
              <Text style={[styles.td, { width: 60, textAlign: 'right' }]}>{uc.businessImpact.score.toFixed(1)}</Text>
              <Text style={[styles.td, { width: 60, textAlign: 'right' }]}>{uc.itDataImpact.score.toFixed(1)}</Text>
              <Text style={[styles.td, { width: 70 }]}>{uc.status}</Text>
            </View>
          ))}
        </View>
      </Page>

      {/* Page 4: risks */}
      <Page size="A4" orientation="landscape" style={styles.page} wrap={false}>
        {pageHeader(period, author, '4 / 5')}
        <Text style={styles.h1}>Risks</Text>
        <Text style={styles.lead}>
          Likelihood × impact heatmap with every risk plotted, followed by the open and monitoring
          register.
        </Text>
        <View style={{ flexDirection: 'row', gap: 16 }}>
          <RiskHeatmapPdf risks={risks} />
          <View style={{ flex: 1 }}>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.th, { flex: 1 }]}>Risk</Text>
                <Text style={[styles.th, { width: 50, textAlign: 'right' }]}>Score</Text>
                <Text style={[styles.th, { width: 100 }]}>Status</Text>
              </View>
              {openRisks.map((r, i, arr) => (
                <View key={r.id} style={i === arr.length - 1 ? styles.tableRowLast : styles.tableRow}>
                  <Text style={[styles.tdBold, { flex: 1 }]}>{r.title}</Text>
                  <Text style={[styles.td, { width: 50, textAlign: 'right' }]}>{r.score}</Text>
                  <Text style={[styles.td, { width: 100 }]}>{r.status}</Text>
                </View>
              ))}
              {openRisks.length === 0 && (
                <View style={styles.tableRowLast}>
                  <Text style={styles.caption}>No open risks.</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </Page>

      {/* Page 5: phase status */}
      <Page size="A4" orientation="landscape" style={styles.page} wrap={false}>
        {pageHeader(period, author, '5 / 5')}
        <Text style={styles.h1}>Phase status</Text>
        <Text style={styles.lead}>
          Planned versus actual across the five phases. Dashed red line marks today.
        </Text>
        <View style={{ alignItems: 'center' }}>
          <PhaseStripe phases={phases} width={PAGE.w - 72 - 100} />
        </View>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, { width: 30 }]}>#</Text>
            <Text style={[styles.th, { flex: 1 }]}>Name</Text>
            <Text style={[styles.th, { width: 120 }]}>Planned</Text>
            <Text style={[styles.th, { width: 120 }]}>Actual</Text>
            <Text style={[styles.th, { width: 90 }]}>Status</Text>
          </View>
          {[...phases].sort((a, b) => a.id - b.id).map((p, i, arr) => (
            <View key={p.id} style={i === arr.length - 1 ? styles.tableRowLast : styles.tableRow}>
              <Text style={[styles.td, { width: 30 }]}>{String(p.id)}</Text>
              <Text style={[styles.tdBold, { flex: 1 }]}>{p.name}</Text>
              <Text style={[styles.td, { width: 120 }]}>
                {p.plannedStart.slice(0, 10)} → {p.plannedEnd.slice(0, 10)}
              </Text>
              <Text style={[styles.td, { width: 120 }]}>
                {p.actualStart?.slice(0, 10) ?? '—'} → {p.actualEnd?.slice(0, 10) ?? (p.actualStart ? 'ongoing' : '—')}
              </Text>
              <Text style={[styles.td, { width: 90 }]}>{p.status}</Text>
            </View>
          ))}
        </View>
        <Path d="" />
      </Page>
    </Document>
  );
}
