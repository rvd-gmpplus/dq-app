import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PillarEnum, StatusEnum, type Pillar } from '@/types/useCase';
import type { UseCase } from '@/types/useCase';
import JiraLink from '@/components/common/JiraLink';
import { useUseCaseStore } from '@/stores/useCaseStore';
import { useStakeholderStore } from '@/stores/stakeholderStore';
import { useDataObjectStore } from '@/stores/dataObjectStore';
import { isValidJiraKey } from '@/lib/jira';

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5">
      <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

function TextField({
  label,
  value,
  onSave,
  placeholder,
  multiline,
  rows,
}: {
  label: string;
  value: string;
  onSave: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
}) {
  const [local, setLocal] = useState(value);
  const commit = () => {
    if (local !== value) onSave(local);
  };
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </span>
      {multiline ? (
        <textarea
          value={local}
          rows={rows ?? 3}
          placeholder={placeholder}
          onChange={(e) => setLocal(e.target.value)}
          onBlur={commit}
          className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm leading-relaxed placeholder:text-slate-400 focus:border-gmp-purple focus:outline-none"
        />
      ) : (
        <input
          type="text"
          value={local}
          placeholder={placeholder}
          onChange={(e) => setLocal(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
          className="w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm placeholder:text-slate-400 focus:border-gmp-purple focus:outline-none"
        />
      )}
    </label>
  );
}

function TagList({
  label,
  values,
  onChange,
  placeholder,
  validate,
}: {
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  validate?: (v: string) => string | null;
}) {
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const add = () => {
    const v = draft.trim();
    if (v.length === 0) return;
    if (validate) {
      const err = validate(v);
      if (err) {
        setError(err);
        return;
      }
    }
    if (values.includes(v)) {
      setDraft('');
      return;
    }
    onChange([...values, v]);
    setDraft('');
    setError(null);
  };
  return (
    <div>
      <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <div className="flex flex-wrap items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 py-1.5">
        {values.map((v) => (
          <span
            key={v}
            className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-700"
          >
            {v}
            <button
              type="button"
              aria-label={`Remove ${v}`}
              onClick={() => onChange(values.filter((x) => x !== v))}
              className="rounded hover:bg-slate-200"
            >
              <Trash2 size={11} />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={draft}
          placeholder={placeholder}
          onChange={(e) => {
            setDraft(e.target.value);
            setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault();
              add();
            }
          }}
          onBlur={add}
          className="flex-1 min-w-[120px] border-none bg-transparent text-sm focus:outline-none"
        />
      </div>
      {error && <div className="mt-1 text-[11px] text-rose-600">{error}</div>}
    </div>
  );
}

export default function OverviewTab({ uc }: { uc: UseCase }) {
  const update = useUseCaseStore((s) => s.update);
  const stakeholders = useStakeholderStore((s) => Object.values(s.items));
  const dataObjects = useDataObjectStore((s) => Object.values(s.items));

  const togglePillar = (p: Pillar) => {
    const next = uc.pillars.includes(p) ? uc.pillars.filter((x) => x !== p) : [...uc.pillars, p];
    if (next.length === 0) return;
    update(uc.id, { pillars: next as UseCase['pillars'] });
  };

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <div className="space-y-5 lg:col-span-2">
        <Section title="Identity">
          <TextField
            label="Title"
            value={uc.title}
            onSave={(v) => update(uc.id, { title: v })}
            placeholder="Short, actionable title (max 80 characters)"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Status
              </span>
              <select
                value={uc.status}
                onChange={(e) => update(uc.id, { status: e.target.value as UseCase['status'] })}
                className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm focus:border-gmp-purple focus:outline-none"
              >
                {StatusEnum.options.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Owner
              </span>
              <select
                value={uc.owner}
                onChange={(e) => update(uc.id, { owner: e.target.value })}
                className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm focus:border-gmp-purple focus:outline-none"
              >
                <option value={uc.owner}>{uc.owner}</option>
                {stakeholders
                  .filter((s) => s.name !== uc.owner)
                  .map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
              </select>
            </label>
          </div>
          <div>
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Strategic pillars
            </span>
            <div className="flex flex-wrap gap-2">
              {PillarEnum.options.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => togglePillar(p)}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs font-medium',
                    uc.pillars.includes(p)
                      ? 'border-gmp-purple bg-gmp-purple text-white'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </Section>

        <Section title="Description" description="Problem, objective, and solution in the TRIMM template.">
          <TextField
            label="Problem"
            value={uc.problem}
            onSave={(v) => update(uc.id, { problem: v })}
            multiline
            rows={4}
            placeholder="What is broken today and for whom?"
          />
          <TextField
            label="Objective"
            value={uc.objective}
            onSave={(v) => update(uc.id, { objective: v })}
            multiline
            rows={3}
            placeholder="What outcome will this use case deliver?"
          />
          <TextField
            label="Solution"
            value={uc.solutionDescription}
            onSave={(v) => update(uc.id, { solutionDescription: v })}
            multiline
            rows={4}
            placeholder="How will the solution work?"
          />
        </Section>

        <Section title="Scope">
          <TagList
            label="In scope"
            values={uc.scopeIn}
            onChange={(v) => update(uc.id, { scopeIn: v })}
            placeholder="Add a scope item and press Enter"
          />
          <TagList
            label="Out of scope"
            values={uc.scopeOut}
            onChange={(v) => update(uc.id, { scopeOut: v })}
            placeholder="What this use case explicitly does not cover"
          />
        </Section>

        <Section title="Measures of success">
          <TagList
            label="KPIs"
            values={uc.kpis}
            onChange={(v) => update(uc.id, { kpis: v })}
            placeholder="Add a measurable KPI"
          />
        </Section>
      </div>

      <aside className="space-y-5">
        <Section title="Linkages">
          <TagList
            label="Data objects"
            values={uc.relatedDataObjects}
            onChange={(v) => update(uc.id, { relatedDataObjects: v })}
            placeholder="Account, Contact, ..."
            validate={(v) =>
              dataObjects.some((d) => d.name === v) ? null : 'Unknown data object'
            }
          />
          <TagList
            label="Jira keys"
            values={uc.relatedJiraKeys}
            onChange={(v) => update(uc.id, { relatedJiraKeys: v })}
            placeholder="GMP-1234"
            validate={(v) => (isValidJiraKey(v) ? null : 'Expected GMP-<number>')}
          />
          {uc.relatedJiraKeys.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {uc.relatedJiraKeys.map((k) => (
                <JiraLink key={k} keyStr={k} />
              ))}
            </div>
          )}
          <TagList
            label="Phases"
            values={uc.relatedPhases.map(String)}
            onChange={(v) =>
              update(uc.id, {
                relatedPhases: v
                  .map((x) => parseInt(x, 10))
                  .filter((n) => n >= 1 && n <= 5) as UseCase['relatedPhases'],
              })
            }
            placeholder="1-5"
            validate={(v) => {
              const n = parseInt(v, 10);
              if (!Number.isFinite(n) || n < 1 || n > 5) return 'Phase 1 to 5';
              return null;
            }}
          />
          <TagList
            label="Tags"
            values={uc.tags}
            onChange={(v) => update(uc.id, { tags: v })}
            placeholder="free text"
          />
        </Section>

        <Section title="Attribution">
          <TextField
            label="Submitted by"
            value={uc.submittedBy}
            onSave={(v) => update(uc.id, { submittedBy: v })}
          />
        </Section>
      </aside>
    </div>
  );
}
