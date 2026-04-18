import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

type RadarDatum = { axis: string; value: number };

export default function ImpactRadar({
  businessData,
  itDataData,
}: {
  businessData: RadarDatum[];
  itDataData: RadarDatum[];
}) {
  const merged = [
    ...businessData.map((d) => ({ axis: d.axis, Business: d.value, 'IT / Data': 0 })),
    ...itDataData.map((d) => ({ axis: d.axis, Business: 0, 'IT / Data': d.value })),
  ];
  // Combine rows with same axis name
  const byAxis: Record<string, { axis: string; Business: number; 'IT / Data': number }> = {};
  for (const row of merged) {
    if (!byAxis[row.axis]) byAxis[row.axis] = { axis: row.axis, Business: 0, 'IT / Data': 0 };
    if (row.Business > 0) byAxis[row.axis]!.Business = row.Business;
    if (row['IT / Data'] > 0) byAxis[row.axis]!['IT / Data'] = row['IT / Data'];
  }
  const data = Object.values(byAxis);

  return (
    <div className="h-72 w-full rounded-md border border-slate-200 bg-white p-3">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="70%">
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis dataKey="axis" tick={{ fontSize: 10, fill: '#475569' }} />
          <PolarRadiusAxis domain={[0, 5]} angle={90} tick={{ fontSize: 10, fill: '#94a3b8' }} />
          <Tooltip
            contentStyle={{
              borderRadius: 6,
              border: '1px solid #e2e8f0',
              fontSize: 12,
            }}
          />
          <Radar
            name="Business impact"
            dataKey="Business"
            stroke="#6859A7"
            fill="#6859A7"
            fillOpacity={0.25}
          />
          <Radar
            name="IT / Data difficulty"
            dataKey="IT / Data"
            stroke="#EA8004"
            fill="#EA8004"
            fillOpacity={0.2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
