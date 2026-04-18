import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PillarEnum, type Pillar } from '@/types/useCase';
import { useUseCaseStore } from '@/stores/useCaseStore';
import { useStakeholderStore } from '@/stores/stakeholderStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useFocusTrap } from '@/hooks/useFocusTrap';

export default function UseCaseForm({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const create = useUseCaseStore((s) => s.create);
  const stakeholders = useStakeholderStore((s) => Object.values(s.items));
  const defaultUser = useSettingsStore((s) => s.currentUser);

  const [title, setTitle] = useState('');
  const [pillars, setPillars] = useState<Pillar[]>([]);
  const [owner, setOwner] = useState(defaultUser);
  const [submittedBy, setSubmittedBy] = useState(defaultUser);
  const [error, setError] = useState<string | null>(null);
  const ref = useFocusTrap<HTMLDivElement>({ active: open, onEscape: onClose });

  useEffect(() => {
    if (open) {
      setTitle('');
      setPillars([]);
      setOwner(defaultUser);
      setSubmittedBy(defaultUser);
      setError(null);
    }
  }, [open, defaultUser]);

  if (!open) return null;

  const toggle = (p: Pillar) =>
    setPillars((list) => (list.includes(p) ? list.filter((x) => x !== p) : [...list, p]));

  const onSubmit = () => {
    if (title.trim().length === 0) {
      setError('Please enter a title (max 80 characters).');
      return;
    }
    if (title.length > 80) {
      setError('Title must be 80 characters or fewer.');
      return;
    }
    if (pillars.length === 0) {
      setError('Select at least one strategic pillar.');
      return;
    }
    const uc = create({ title: title.trim(), pillars, owner, submittedBy });
    onClose();
    navigate(`/use-cases/${uc.id}`);
  };

  return (
    <div
      className="fixed inset-0 z-40 flex justify-end bg-slate-900/30"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        ref={ref}
        className="flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-900">New use case</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <p className="text-sm text-slate-600">
            Capture the basics. Scoring, description, and linkages come next on the detail page.
          </p>

          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Title
            </label>
            <input
              type="text"
              value={title}
              maxLength={80}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Standardised business request form"
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:border-gmp-purple focus:outline-none"
            />
            <div className="mt-1 text-[11px] text-slate-400">
              {title.length} of 80 characters
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Strategic pillars
            </label>
            <div className="flex flex-wrap gap-2">
              {PillarEnum.options.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => toggle(p)}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                    pillars.includes(p)
                      ? 'border-gmp-purple bg-gmp-purple text-white'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Owner
              </label>
              <select
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-white px-2 py-2 text-sm focus:border-gmp-purple focus:outline-none"
              >
                <option value={defaultUser}>{defaultUser}</option>
                {stakeholders
                  .filter((s) => s.name !== defaultUser)
                  .map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Submitted by
              </label>
              <select
                value={submittedBy}
                onChange={(e) => setSubmittedBy(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-white px-2 py-2 text-sm focus:border-gmp-purple focus:outline-none"
              >
                <option value={defaultUser}>{defaultUser}</option>
                {stakeholders
                  .filter((s) => s.name !== defaultUser)
                  .map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              {error}
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-6 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            className="rounded-md bg-gmp-purple px-3 py-1.5 text-sm font-medium text-white hover:bg-gmp-purple-700"
          >
            Create and open
          </button>
        </div>
      </div>
    </div>
  );
}
