import { useMemo, useState } from 'react';
import { MessageSquare, History as HistoryIcon, Send } from 'lucide-react';
import { fmtDateTime, fmtRelative } from '@/lib/dates';
import { useUseCaseStore } from '@/stores/useCaseStore';
import type { UseCase, HistoryEntry, Comment } from '@/types/useCase';

type TimelineItem =
  | { kind: 'history'; at: string; by: string; entry: HistoryEntry }
  | { kind: 'comment'; at: string; by: string; entry: Comment };

function formatDiffValue(v: unknown): string {
  if (v === null || v === undefined) return 'empty';
  if (typeof v === 'string') return v.length > 40 ? `${v.slice(0, 37)}...` : v;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  return JSON.stringify(v).slice(0, 40);
}

function HistoryCard({ item }: { item: Extract<TimelineItem, { kind: 'history' }> }) {
  const { entry } = item;
  return (
    <div className="rounded-md border border-slate-200 bg-white px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-2 text-xs text-slate-500">
          <HistoryIcon size={12} aria-hidden="true" />
          <span className="font-medium text-slate-700">{entry.by}</span>
          <span>{entry.action}</span>
        </div>
        <time className="text-[11px] text-slate-400" title={fmtDateTime(entry.at)}>
          {fmtRelative(entry.at)}
        </time>
      </div>
      {entry.diffs && entry.diffs.length > 0 && (
        <ul className="mt-2 space-y-1 text-xs text-slate-600">
          {entry.diffs.map((d, idx) => (
            <li key={`${d.field}-${idx}`} className="font-mono text-[11px]">
              <span className="text-slate-500">{d.field}:</span>{' '}
              <span className="line-through text-slate-400">{formatDiffValue(d.before)}</span>{' '}
              <span className="text-gmp-purple-700">{formatDiffValue(d.after)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CommentCard({ item }: { item: Extract<TimelineItem, { kind: 'comment' }> }) {
  const { entry } = item;
  return (
    <div className="rounded-md border border-gmp-purple-200 bg-gmp-purple-50 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-2 text-xs text-gmp-purple-700">
          <MessageSquare size={12} aria-hidden="true" />
          <span className="font-medium">{entry.by}</span>
        </div>
        <time className="text-[11px] text-gmp-purple-700/80" title={fmtDateTime(entry.at)}>
          {fmtRelative(entry.at)}
        </time>
      </div>
      <p className="mt-2 whitespace-pre-wrap text-sm text-slate-800">{entry.text}</p>
    </div>
  );
}

export default function HistoryTimeline({ uc }: { uc: UseCase }) {
  const addComment = useUseCaseStore((s) => s.addComment);
  const [draft, setDraft] = useState('');

  const items = useMemo<TimelineItem[]>(() => {
    const history: TimelineItem[] = uc.history.map((h) => ({
      kind: 'history',
      at: h.at,
      by: h.by,
      entry: h,
    }));
    const comments: TimelineItem[] = uc.comments.map((c) => ({
      kind: 'comment',
      at: c.at,
      by: c.by,
      entry: c,
    }));
    return [...history, ...comments].sort((a, b) => (a.at < b.at ? 1 : -1));
  }, [uc.history, uc.comments]);

  const onPost = () => {
    const text = draft.trim();
    if (text.length === 0) return;
    addComment(uc.id, text);
    setDraft('');
  };

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">
          Add a comment
        </label>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
          placeholder="Share context, questions, or a status note."
          className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:border-gmp-purple focus:outline-none"
        />
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            onClick={onPost}
            disabled={draft.trim().length === 0}
            className="inline-flex items-center gap-1.5 rounded-md bg-gmp-purple px-3 py-1.5 text-sm font-medium text-white hover:bg-gmp-purple-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            <Send size={13} aria-hidden="true" />
            Post
          </button>
        </div>
      </section>

      <section className="space-y-2">
        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 bg-white px-6 py-8 text-center text-sm text-slate-500">
            No activity yet. Edits and comments will appear here.
          </div>
        ) : (
          items.map((item) =>
            item.kind === 'history' ? (
              <HistoryCard key={`h-${item.at}-${item.entry.action}`} item={item} />
            ) : (
              <CommentCard key={`c-${item.entry.id}`} item={item} />
            ),
          )
        )}
      </section>
    </div>
  );
}
