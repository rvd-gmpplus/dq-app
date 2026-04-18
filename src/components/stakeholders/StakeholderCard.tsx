import { Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Stakeholder } from '@/types/stakeholder';

const GROUP_STYLE: Record<Stakeholder['group'], string> = {
  Internal: 'bg-gmp-purple-50 text-gmp-purple-700',
  SME: 'bg-gmp-green-50 text-gmp-green-700',
  External: 'bg-slate-100 text-slate-600',
  Sponsor: 'bg-gmp-orange-50 text-orange-700',
};

const RACI_STYLE: Record<Stakeholder['raci'], string> = {
  R: 'bg-gmp-purple text-white',
  A: 'bg-gmp-green text-white',
  C: 'bg-gmp-orange text-white',
  I: 'bg-slate-500 text-white',
};

function initials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase();
}

export default function StakeholderCard({ stakeholder }: { stakeholder: Stakeholder }) {
  return (
    <article className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gmp-purple-50 text-sm font-semibold text-gmp-purple-700">
          {initials(stakeholder.name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-slate-900">{stakeholder.name}</div>
          <div className="truncate text-xs text-slate-500">{stakeholder.role}</div>
        </div>
        <span
          className={cn(
            'inline-flex h-6 w-6 items-center justify-center rounded-md text-[11px] font-bold',
            RACI_STYLE[stakeholder.raci],
          )}
          title={`Default RACI: ${stakeholder.raci}`}
        >
          {stakeholder.raci}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-[11px]">
        <span
          className={cn(
            'rounded-full px-2 py-0.5 font-medium',
            GROUP_STYLE[stakeholder.group],
          )}
        >
          {stakeholder.group}
        </span>
        {stakeholder.pillar && (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">
            {stakeholder.pillar}
          </span>
        )}
      </div>
      {stakeholder.contact && (
        <a
          href={`mailto:${stakeholder.contact}`}
          className="inline-flex items-center gap-1.5 text-xs text-gmp-purple-700 hover:underline"
        >
          <Mail size={11} aria-hidden="true" />
          {stakeholder.contact}
        </a>
      )}
      {stakeholder.notes && (
        <p className="text-xs text-slate-500">{stakeholder.notes}</p>
      )}
    </article>
  );
}
