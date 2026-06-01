import { useState, useRef, useEffect } from 'react';
import { COLUMNS, USERS } from '../data/mockData';
import { canEditTask, canDeleteTask } from '../utils/permissions';
import { getUsersByIds } from '../utils/users';

const PRIORITY_OPTIONS = ['Urgent', 'High', 'Medium', 'Low'];

const PRIORITY_DOT = {
  Urgent: 'bg-red-500',
  High:   'bg-amber-500',
  Medium: 'bg-blue-500',
  Low:    'bg-slate-300',
};

const PRIORITY_PILL = {
  Urgent: 'bg-red-50 text-red-600',
  High:   'bg-amber-50 text-amber-600',
  Medium: 'bg-blue-50 text-blue-600',
  Low:    'bg-slate-100 text-slate-500',
};

// ─── Assignee Picker ─────────────────────────────────────────────────────────

function AssigneePicker({ assignedUserIds, onChange, canEdit }) {
  const [open,   setOpen]   = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const assigned = getUsersByIds(assignedUserIds ?? []);
  const extra    = assigned.length - 3;
  const filtered = USERS.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    (u.title ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (uid) => {
    const ids = assignedUserIds ?? [];
    onChange(ids.includes(uid) ? ids.filter(id => id !== uid) : [...ids, uid]);
  };

  return (
    <div className="relative" ref={ref}>
      {/* Facepile + trigger */}
      <button
        type="button"
        onClick={() => canEdit && setOpen(o => !o)}
        className={`flex items-center gap-2 group ${canEdit ? 'cursor-pointer' : 'cursor-default'}`}
      >
        <div className="flex -space-x-2">
          {assigned.slice(0, 3).map(u => (
            <span
              key={u.id}
              title={u.name}
              className="w-7 h-7 rounded-full bg-gp-cream text-gp-midnight text-xs font-bold flex items-center justify-center ring-2 ring-white shrink-0"
            >
              {u.avatar}
            </span>
          ))}
          {extra > 0 && (
            <span className="w-7 h-7 rounded-full bg-gp-fl3 text-white text-xs font-bold flex items-center justify-center ring-2 ring-white shrink-0">
              +{extra}
            </span>
          )}
        </div>
        {assigned.length === 0 && (
          <span className="text-xs text-gp-fl3 italic">Nobody assigned</span>
        )}
        {canEdit && (
          <span className="text-xs text-gp-coral opacity-0 group-hover:opacity-100 transition-opacity ml-1">
            {assigned.length === 0 ? '+ Add' : 'Edit'}
          </span>
        )}
      </button>

      {/* Floating dropdown */}
      {open && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-[rgba(22,25,22,0.15)] rounded-xl shadow-xl z-50 overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-[rgba(22,25,22,0.08)]">
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search people…"
              className="w-full text-xs px-3 py-2 rounded-lg border border-[rgba(22,25,22,0.12)] bg-gp-sunrise text-gp-midnight placeholder-gp-fl3 focus:outline-none focus:ring-2 focus:ring-[#FF555F]/20 focus:border-gp-coral transition"
            />
          </div>
          {/* List */}
          <div className="max-h-56 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-xs text-gp-fl3 px-4 py-3">No results.</p>
            ) : (
              filtered.map(u => {
                const checked = (assignedUserIds ?? []).includes(u.id);
                return (
                  <label
                    key={u.id}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-gp-sunrise cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(u.id)}
                      className="rounded accent-[#FF555F] w-3.5 h-3.5 shrink-0"
                    />
                    <span className="w-6 h-6 rounded-full bg-gp-cream text-gp-midnight text-xs font-bold flex items-center justify-center shrink-0">
                      {u.avatar}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gp-midnight truncate">{u.name}</p>
                      <p className="text-[10px] text-gp-fl3 truncate">{u.title}</p>
                    </div>
                    <span className="text-[10px] bg-gp-cream text-gp-fl2 px-1.5 py-0.5 rounded shrink-0">{u.department}</span>
                  </label>
                );
              })
            )}
          </div>
          {/* Footer summary */}
          {assigned.length > 0 && (
            <div className="px-3 py-2 border-t border-[rgba(22,25,22,0.08)] text-[10px] text-gp-fl3">
              {assigned.length} assignee{assigned.length !== 1 ? 's' : ''} selected
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Drawer ───────────────────────────────────────────────────────────────────

export default function TaskDetailModal({ task, onClose, onSave, onDelete, currentUser }) {
  const [edited, setEdited] = useState({ ...task });

  const canEdit = canEditTask(currentUser, task);
  const canDel  = canDeleteTask(currentUser, task);

  const inputCls = (extra = '') =>
    `w-full border border-[rgba(22,25,22,0.12)] rounded-lg px-3 py-2 text-sm text-gp-midnight placeholder-gp-fl3 focus:outline-none focus:ring-2 focus:ring-[#FF555F]/20 focus:border-gp-coral transition bg-white ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''} ${extra}`;

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gp-midnight/40 backdrop-enter"
        onClick={onClose}
      />

      {/* Drawer — right-anchored */}
      <div className="absolute top-0 right-0 h-full w-[720px] max-w-[90vw] bg-white border-l-2 border-gp-midnight shadow-2xl flex flex-col drawer-enter">

        {/* ── Sticky header ── */}
        <div className="flex items-start gap-3 px-6 py-5 border-b border-[rgba(22,25,22,0.08)] shrink-0">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold text-gp-fl3 uppercase tracking-widest mb-1">Task Detail</p>
            <input
              className={`text-xl font-bold w-full focus:outline-none border-b pb-0.5 transition ${
                canEdit
                  ? 'border-[rgba(22,25,22,0.15)] text-gp-midnight focus:border-gp-coral'
                  : 'border-transparent text-gp-fl1 cursor-not-allowed'
              }`}
              value={edited.title}
              onChange={e => setEdited({ ...edited, title: e.target.value })}
              readOnly={!canEdit}
            />
          </div>
          <button
            onClick={onClose}
            className="text-gp-fl3 hover:text-gp-midnight text-2xl leading-none mt-1 shrink-0 transition-colors"
          >
            ×
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex h-full">

            {/* Main content — 2/3 */}
            <div className="flex-[2] border-r border-[rgba(22,25,22,0.08)] px-6 py-5 flex flex-col gap-5">

              {/* Read-only banner */}
              {!canEdit && (
                <div className="bg-amber-50 border border-amber-200 text-amber-700 text-xs rounded-lg px-3 py-2">
                  You have read-only access to this task.
                </div>
              )}

              {/* Description */}
              <div>
                <label className="text-[10px] font-semibold text-gp-fl3 uppercase tracking-widest block mb-2">Description</label>
                <textarea
                  className={inputCls('resize-none')}
                  rows={7}
                  placeholder="Add a description…"
                  value={edited.description ?? ''}
                  onChange={e => setEdited({ ...edited, description: e.target.value })}
                  readOnly={!canEdit}
                />
              </div>

              {/* Sync Request — only when blocked */}
              {task.column === 'Blocked' && (
                <div>
                  <label className="text-[10px] font-semibold text-gp-fl3 uppercase tracking-widest block mb-2">Sync Request</label>
                  {edited.meetingRequest !== null ? (
                    <div className="flex items-start gap-2 bg-orange-50 border border-orange-100 rounded-lg px-3 py-2.5">
                      <span className="text-sm text-orange-700 flex-1">{edited.meetingRequest}</span>
                      {canEdit && (
                        <button
                          className="text-xs text-red-400 hover:text-red-600 underline shrink-0 transition-colors"
                          onClick={() => setEdited({ ...edited, meetingRequest: null })}
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  ) : (
                    <input
                      className={inputCls()}
                      placeholder="Request a sync — state reason"
                      maxLength={80}
                      value={edited.meetingRequest || ''}
                      onChange={e => setEdited({ ...edited, meetingRequest: e.target.value || null })}
                      readOnly={!canEdit}
                    />
                  )}
                </div>
              )}

              {/* Source tag */}
              {task.fromMeeting && (
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-purple-50 text-purple-600 px-2.5 py-1 rounded-full font-medium border border-purple-100">
                    From Meeting
                  </span>
                </div>
              )}
            </div>

            {/* Metadata sidebar — 1/3 */}
            <div className="flex-1 px-5 py-5 flex flex-col gap-5 bg-gp-sunrise/50">

              {/* Priority */}
              <div>
                <label className="text-[10px] font-semibold text-gp-fl3 uppercase tracking-widest block mb-2">Priority</label>
                <div className="flex flex-col gap-1">
                  {PRIORITY_OPTIONS.map(p => (
                    <button
                      key={p}
                      type="button"
                      disabled={!canEdit}
                      onClick={() => canEdit && setEdited({ ...edited, priority: p })}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                        edited.priority === p
                          ? `${PRIORITY_PILL[p]} border-current/20`
                          : 'text-gp-fl2 border-transparent hover:bg-gp-cream'
                      } ${!canEdit ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                    >
                      <span className={`w-2 h-2 rounded-full shrink-0 ${PRIORITY_DOT[p]}`} />
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="text-[10px] font-semibold text-gp-fl3 uppercase tracking-widest block mb-2">Status</label>
                <select
                  className={inputCls()}
                  value={edited.column}
                  onChange={e => setEdited({ ...edited, column: e.target.value })}
                  disabled={!canEdit}
                >
                  {COLUMNS.map(col => <option key={col} value={col}>{col}</option>)}
                </select>
              </div>

              {/* Due Date */}
              <div>
                <label className="text-[10px] font-semibold text-gp-fl3 uppercase tracking-widest block mb-2">Due Date</label>
                <input
                  type="date"
                  className={inputCls()}
                  value={edited.dueDate ?? ''}
                  onChange={e => setEdited({ ...edited, dueDate: e.target.value || null })}
                  readOnly={!canEdit}
                />
              </div>

              {/* Assignees */}
              <div>
                <label className="text-[10px] font-semibold text-gp-fl3 uppercase tracking-widest block mb-2">Assignees</label>
                <AssigneePicker
                  assignedUserIds={edited.assignedUserIds ?? []}
                  onChange={ids => setEdited({ ...edited, assignedUserIds: ids })}
                  canEdit={canEdit}
                />
                {/* Chip list */}
                {(edited.assignedUserIds ?? []).length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {getUsersByIds(edited.assignedUserIds ?? []).map(u => (
                      <span
                        key={u.id}
                        className="inline-flex items-center gap-1 text-[11px] bg-gp-cream text-gp-midnight border border-[rgba(22,25,22,0.12)] px-2 py-0.5 rounded-full"
                      >
                        <span className="font-bold">{u.avatar}</span>
                        {u.name}
                        {canEdit && (
                          <button
                            className="ml-0.5 text-gp-fl3 hover:text-red-500 transition-colors text-xs leading-none"
                            onClick={() => setEdited({
                              ...edited,
                              assignedUserIds: (edited.assignedUserIds ?? []).filter(id => id !== u.id)
                            })}
                          >
                            ×
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Sticky footer ── */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[rgba(22,25,22,0.08)] bg-gp-sunrise/60 shrink-0">
          <div>
            {canDel && (
              <button
                className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
                onClick={() => { onDelete(task.id); onClose(); }}
              >
                Delete task
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              className="text-sm text-gp-fl2 hover:text-gp-midnight px-4 py-2 transition-colors"
              onClick={onClose}
            >
              Cancel
            </button>
            {canEdit && (
              <button
                className="text-sm bg-gp-midnight hover:bg-gp-fl1 text-white rounded-lg px-5 py-2 font-semibold transition-colors"
                onClick={() => { onSave(edited); onClose(); }}
              >
                Save changes
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
