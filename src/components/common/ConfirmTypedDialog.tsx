import { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useFocusTrap } from '@/hooks/useFocusTrap';

export default function ConfirmTypedDialog({
  open,
  title,
  description,
  confirmWord,
  confirmButtonLabel = 'Confirm',
  tone = 'danger',
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmWord: string;
  confirmButtonLabel?: string;
  tone?: 'danger' | 'caution';
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const [typed, setTyped] = useState('');
  const ref = useFocusTrap<HTMLDivElement>({ active: open, onEscape: onCancel });

  useEffect(() => {
    if (open) setTyped('');
  }, [open]);

  if (!open) return null;

  const canConfirm = typed === confirmWord;
  const tonePalette =
    tone === 'danger'
      ? {
          iconBg: 'bg-rose-50 text-rose-700',
          button: 'bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300',
        }
      : {
          iconBg: 'bg-amber-50 text-amber-700',
          button: 'bg-amber-600 hover:bg-amber-700 disabled:bg-amber-300',
        };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-description"
      onClick={onCancel}
    >
      <div
        ref={ref}
        className="w-full max-w-md rounded-lg border border-slate-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 px-5 py-4">
          <span className={`mt-1 rounded-md p-2 ${tonePalette.iconBg}`}>
            <AlertTriangle size={16} aria-hidden="true" />
          </span>
          <div className="flex-1">
            <h2 id="confirm-title" className="text-sm font-semibold text-slate-900">
              {title}
            </h2>
            <p id="confirm-description" className="mt-1 text-sm text-slate-600">
              {description}
            </p>
            <label className="mt-3 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Type <span className="font-mono text-slate-900">{confirmWord}</span> to confirm
            </label>
            <input
              type="text"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && canConfirm) onConfirm();
              }}
              aria-label={`Type ${confirmWord} to confirm`}
              className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm focus:border-gmp-purple focus:outline-none"
              autoFocus
            />
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onCancel}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={14} />
          </button>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50 px-5 py-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canConfirm}
            onClick={onConfirm}
            className={`rounded-md px-3 py-1.5 text-sm font-medium text-white disabled:cursor-not-allowed ${tonePalette.button}`}
          >
            {confirmButtonLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
