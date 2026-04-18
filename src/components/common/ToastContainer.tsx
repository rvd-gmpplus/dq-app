import { useEffect } from 'react';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { useToastStore, type ToastTone } from '@/stores/toastStore';
import { cn } from '@/lib/utils';

const AUTO_DISMISS_MS: Record<ToastTone, number> = {
  info: 4000,
  success: 3500,
  error: 6000,
};

const TONE_STYLES: Record<ToastTone, string> = {
  info: 'border-slate-200 bg-white text-slate-800',
  success: 'border-emerald-200 bg-gmp-green-50 text-gmp-green-700',
  error: 'border-rose-200 bg-rose-50 text-rose-700',
};

const TONE_ICON: Record<ToastTone, typeof Info> = {
  info: Info,
  success: CheckCircle2,
  error: AlertTriangle,
};

export default function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  useEffect(() => {
    if (toasts.length === 0) return;
    const timers = toasts.map((t) =>
      setTimeout(() => dismiss(t.id), AUTO_DISMISS_MS[t.tone]),
    );
    return () => {
      for (const timer of timers) clearTimeout(timer);
    };
  }, [toasts, dismiss]);

  if (toasts.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed bottom-6 right-6 z-[60] flex w-[22rem] flex-col gap-2"
      role="region"
      aria-label="Notifications"
      aria-live="polite"
    >
      {toasts.map((t) => {
        const Icon = TONE_ICON[t.tone];
        return (
          <div
            key={t.id}
            role={t.tone === 'error' ? 'alert' : 'status'}
            className={cn(
              'pointer-events-auto flex items-start gap-3 rounded-lg border px-4 py-3 text-sm shadow-lg',
              TONE_STYLES[t.tone],
            )}
          >
            <Icon size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
            <div className="flex-1">{t.text}</div>
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() => dismiss(t.id)}
              className="rounded-md p-0.5 text-current opacity-60 hover:bg-black/5 hover:opacity-100"
            >
              <X size={13} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
