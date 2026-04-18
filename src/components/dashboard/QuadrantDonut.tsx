import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { Quadrant, UseCase } from '@/types/useCase';

const COLOUR: Record<Quadrant, string> = {
  QuickWin: '#38B769',
  Strategic: '#6859A7',
  Filler: '#EA8004',
  DontPursue: '#9CA3AF',
};

const LABEL: Record<Quadrant, string> = {
  QuickWin: 'Quick wins',
  Strategic: 'Strategic bets',
  Filler: 'Fillers',
  DontPursue: "Don't pursue",
};

export default function QuadrantDonut({ useCases }: { useCases: UseCase[] }) {
  const counts: Record<Quadrant, number> = {
    QuickWin: 0,
    Strategic: 0,
    Filler: 0,
    DontPursue: 0,
  };
  for (const uc of useCases) counts[uc.quadrant] += 1;
  const data = (Object.keys(counts) as Quadrant[])
    .filter((k) => counts[k] > 0)
    .map((k) => ({ name: LABEL[k], key: k, value: counts[k] }));

  if (data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-xs text-slate-500">
        No scored use cases yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          innerRadius="55%"
          outerRadius="85%"
          dataKey="value"
          paddingAngle={2}
          stroke="white"
        >
          {data.map((d) => (
            <Cell key={d.key} fill={COLOUR[d.key]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            borderRadius: 6,
            border: '1px solid #e2e8f0',
            fontSize: 12,
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
