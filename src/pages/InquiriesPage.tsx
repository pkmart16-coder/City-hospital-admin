import React, { useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { useHospital } from '../context/HospitalContext';
import { formatDateTime } from '../utils/formatters';

export const InquiriesPage: React.FC = () => {
  const { inquiries, replyInquiry } = useHospital();
  const [filter, setFilter] = useState<'New' | 'Answered' | 'All'>('New');
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [faq, setFaq] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  const list = inquiries.filter(i => filter === 'All' || i.status === filter);

  const send = async (id: string) => {
    const text = (drafts[id] || '').trim();
    if (text.length < 3) {
      setError('Please type a reply first.');
      return;
    }
    setError('');
    setBusy(id);
    try {
      await replyInquiry(id, text, !!faq[id]);
    } catch {
      setError('Reply could not be saved. Check your permissions and connection.');
    } finally {
      setBusy('');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-teal-500" /> Website Questions
          </h1>
          <p className="text-xs text-slate-500">Questions asked by patients on the public website. Your reply appears on the website for that patient.</p>
        </div>
        <div className="flex gap-1">
          {(['New', 'Answered', 'All'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs rounded-lg border ${filter === f ? 'bg-teal-600 text-white border-teal-600' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-xs text-rose-600">{error}</p>}
      {list.length === 0 && <p className="text-sm text-slate-500">No questions in this view.</p>}

      {list.map(q => (
        <div key={q.id} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 space-y-3">
          <div className="flex justify-between gap-3 flex-wrap text-xs text-slate-500">
            <span>
              <b className="text-slate-900 dark:text-white">{q.name}</b> · {q.phone}{q.email ? ` · ${q.email}` : ''}
            </span>
            <span>{formatDateTime(q.createdAt)} · <b className={q.status === 'New' ? 'text-amber-600' : 'text-emerald-600'}>{q.status}</b></span>
          </div>
          <p className="text-sm text-slate-800 dark:text-slate-100 whitespace-pre-wrap">{q.message}</p>

          {q.status === 'Answered' ? (
            <div className="rounded-lg bg-teal-50 dark:bg-slate-800 p-3 text-sm">
              <p className="whitespace-pre-wrap">{q.reply}</p>
              <p className="text-[11px] text-slate-500 mt-2">Replied by {q.repliedBy} · {formatDateTime(q.repliedAt)}</p>
            </div>
          ) : (
            <div className="space-y-2">
              <textarea
                rows={3}
                value={drafts[q.id] || ''}
                onChange={e => setDrafts(p => ({ ...p, [q.id]: e.target.value }))}
                placeholder="Type your reply to the patient..."
                className="w-full text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-slate-900 dark:text-white"
              />
              <div className="flex items-center justify-between flex-wrap gap-2">
                <label className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
                  <input type="checkbox" checked={!!faq[q.id]} onChange={e => setFaq(p => ({ ...p, [q.id]: e.target.checked }))} />
                  Also publish as a public FAQ (patient name is not shown)
                </label>
                <button
                  onClick={() => send(q.id)}
                  disabled={busy === q.id}
                  className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white text-xs font-semibold px-4 py-2 rounded-lg"
                >
                  <Send className="w-3.5 h-3.5" /> {busy === q.id ? 'Sending...' : 'Send reply'}
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};