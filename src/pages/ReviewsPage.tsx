import React, { useState } from 'react';
import { Star, Pin, Trash2, CheckCircle2, EyeOff, BadgeCheck } from 'lucide-react';
import { useHospital } from '../context/HospitalContext';
import { Review } from '../types';
import { formatDateTime } from '../utils/formatters';

const Stars: React.FC<{ n: number }> = ({ n }) => (
  <span className="text-amber-500 tracking-tight" aria-label={`${n} out of 5 stars`}>
    {'★'.repeat(n)}<span className="text-slate-300">{'★'.repeat(5 - n)}</span>
  </span>
);

export const ReviewsPage: React.FC = () => {
  const { reviews, updateReview, deleteReview } = useHospital();
  const [filter, setFilter] = useState<'Pending' | 'Approved' | 'Hidden' | 'All'>('Pending');
  const [replies, setReplies] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  const list = reviews
    .filter((r) => filter === 'All' || r.status === filter)
    .sort((a, b) => Number(b.isPinned) - Number(a.isPinned) || (b.createdAt || '').localeCompare(a.createdAt || ''));

  const approved = reviews.filter((r) => r.status === 'Approved');
  const avg = approved.length ? (approved.reduce((s, r) => s + r.rating, 0) / approved.length).toFixed(1) : '—';

  const act = async (id: string, fn: () => Promise<void>) => {
    setError('');
    setBusy(id);
    try {
      await fn();
    } catch {
      setError('Action failed. Check your permissions and connection.');
    } finally {
      setBusy('');
    }
  };

  const set = (r: Review, u: Partial<Review>) => act(r.id, () => updateReview(r.id, u));

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500" /> Patient Reviews
          </h1>
          <p className="text-xs text-slate-500">
            New reviews stay hidden until you approve them. Pinned reviews appear first on the website. Average of approved: <b>{avg}</b> ({approved.length} reviews)
          </p>
        </div>
        <div className="flex gap-1">
          {(['Pending', 'Approved', 'Hidden', 'All'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs rounded-lg border ${filter === f ? 'bg-teal-600 text-white border-teal-600' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700'}`}
            >
              {f}{f !== 'All' ? ` (${reviews.filter((r) => r.status === f).length})` : ''}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-xs text-rose-600">{error}</p>}
      {list.length === 0 && <p className="text-sm text-slate-500">No reviews in this view.</p>}

      {list.map((r) => (
        <div key={r.id} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 space-y-3">
          <div className="flex justify-between gap-3 flex-wrap text-xs text-slate-500">
            <span className="flex items-center gap-2">
              <Stars n={r.rating} />
              <b className="text-slate-900 dark:text-white">{r.patientName}</b>
              {r.doctorName ? <span>· for {r.doctorName}</span> : null}
              {r.isPinned && <span className="text-amber-600 font-semibold">· Pinned</span>}
              {r.isVerified && <span className="text-emerald-600 font-semibold">· Verified patient</span>}
            </span>
            <span>{formatDateTime(r.createdAt)} · <b>{r.status}</b></span>
          </div>
          <p className="text-sm text-slate-800 dark:text-slate-100 whitespace-pre-wrap">{r.comment}</p>

          <div className="flex flex-wrap gap-2">
            {r.status !== 'Approved' && (
              <button disabled={busy === r.id} onClick={() => set(r, { status: 'Approved' })} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-emerald-600 text-white disabled:opacity-60">
                <CheckCircle2 className="w-3.5 h-3.5" /> Approve & publish
              </button>
            )}
            {r.status !== 'Hidden' && (
              <button disabled={busy === r.id} onClick={() => set(r, { status: 'Hidden', isPinned: false })} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-60">
                <EyeOff className="w-3.5 h-3.5" /> Hide
              </button>
            )}
            {r.status === 'Approved' && (
              <button disabled={busy === r.id} onClick={() => set(r, { isPinned: !r.isPinned })} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border border-amber-400 text-amber-700 dark:text-amber-300 disabled:opacity-60">
                <Pin className="w-3.5 h-3.5" /> {r.isPinned ? 'Unpin' : 'Pin to top'}
              </button>
            )}
            <button disabled={busy === r.id} onClick={() => set(r, { isVerified: !r.isVerified })} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-60">
              <BadgeCheck className="w-3.5 h-3.5" /> {r.isVerified ? 'Remove verified' : 'Mark verified patient'}
            </button>
            <button
              disabled={busy === r.id}
              onClick={() => { if (window.confirm('Delete this review permanently?')) act(r.id, () => deleteReview(r.id)); }}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border border-rose-300 text-rose-700 disabled:opacity-60"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>

          <div className="space-y-1">
            <textarea
              rows={2}
              value={replies[r.id] ?? r.reply ?? ''}
              onChange={(e) => setReplies((p) => ({ ...p, [r.id]: e.target.value }))}
              placeholder="Public reply from the hospital (optional)"
              className="w-full text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-slate-900 dark:text-white"
            />
            <button
              disabled={busy === r.id || (replies[r.id] ?? r.reply ?? '') === (r.reply ?? '')}
              onClick={() => set(r, { reply: (replies[r.id] ?? '').trim() })}
              className="px-3 py-1.5 text-xs rounded-lg bg-teal-600 text-white disabled:opacity-50"
            >
              Save reply
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};