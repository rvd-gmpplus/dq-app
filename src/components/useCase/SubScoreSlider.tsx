import { cn } from '@/lib/utils';

export default function SubScoreSlider({
  label,
  description,
  value,
  onChange,
  scaleHint,
}: {
  label: string;
  description: string;
  value: number;
  onChange: (v: number) => void;
  scaleHint?: string;
}) {
  return (
    <div className="rounded-md border border-slate-200 bg-white px-4 py-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-slate-800">{label}</div>
          <p className="text-[11px] text-slate-500">{description}</p>
        </div>
        <span
          className={cn(
            'inline-flex h-7 w-8 items-center justify-center rounded-md text-sm font-semibold tabular-nums',
            'bg-gmp-purple-50 text-gmp-purple-700',
          )}
        >
          {value}
        </span>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <span className="text-[11px] text-slate-400">1</span>
        <input
          type="range"
          min={1}
          max={5}
          step={1}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value, 10))}
          className="flex-1 accent-gmp-purple"
          aria-label={label}
        />
        <span className="text-[11px] text-slate-400">5</span>
      </div>
      {scaleHint && <p className="mt-1 text-[11px] italic text-slate-400">{scaleHint}</p>}
    </div>
  );
}
