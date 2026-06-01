import { useState } from 'react';
import { USERS, TEAMS, COLUMNS } from '../data/mockData';

const MEETING_TYPES = ['Daily Scrum', 'Weekly Sync', 'Planning', 'Retrospective', 'Other'];

const inputCls  = 'w-full border border-[rgba(22,25,22,0.15)] rounded-lg px-3 py-2.5 text-sm text-gp-midnight placeholder-gp-fl3 focus:outline-none focus:ring-2 focus:ring-[#FF555F]/20 focus:border-gp-coral transition bg-white';
const selectCls = 'w-full border border-[rgba(22,25,22,0.15)] rounded-lg px-3 py-2 text-sm text-gp-midnight bg-white focus:outline-none focus:ring-2 focus:ring-[#FF555F]/20 focus:border-gp-coral cursor-pointer transition';

// ─── Participant picker (inline, multi-team) ──────────────────────────────────

function ParticipantPicker({ selectedIds, onChange }) {
  const toggle = (uid) =>
    onChange(selectedIds.includes(uid) ? selectedIds.filter(id => id !== uid) : [...selectedIds, uid]);

  const toggleTeam = (team) => {
    const ids = team.memberIds;
    const allOn = ids.every(id => selectedIds.includes(id));
    onChange(allOn
      ? selectedIds.filter(id => !ids.includes(id))
      : [...new Set([...selectedIds, ...ids])]);
  };

  return (
    <div className="flex flex-col gap-2 border border-[rgba(22,25,22,0.10)] rounded-xl p-4 bg-gp-sunrise">
      <p className="text-xs font-semibold text-gp-fl2 uppercase tracking-wide">
        Participants
        {selectedIds.length > 0 && (
          <span className="ml-2 normal-case font-normal text-gp-fl3">({selectedIds.length} selected)</span>
        )}
      </p>
      {TEAMS.map(team => (
        <div key={team.id} className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gp-fl1">{team.name}</p>
            <button type="button" onClick={() => toggleTeam(team)}
              className="text-xs px-2 py-0.5 rounded-full font-medium border bg-white text-gp-fl2 border-[rgba(22,25,22,0.12)] hover:bg-gp-cream transition-colors">
              {team.memberIds.every(id => selectedIds.includes(id)) ? 'Deselect all' : 'Select all'}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {USERS.filter(u => team.memberIds.includes(u.id)).map(u => {
              const on = selectedIds.includes(u.id);
              return (
                <button key={u.id} type="button" onClick={() => toggle(u.id)} title={u.title}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    on ? 'bg-gp-midnight text-white border-gp-midnight' : 'bg-white text-gp-fl3 border-[rgba(22,25,22,0.12)] opacity-50'
                  }`}>
                  <span>{u.avatar}</span><span>{u.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

const EMPTY_NEW = { title: '', type: 'Daily Scrum', date: '', participantIds: [] };

export default function MeetingNotes({ currentUser, addTask }) {
  const [meetings,         setMeetings]         = useState([]);
  const [pendingItems,     setPendingItems]      = useState([]);
  const [selectedId,       setSelectedId]        = useState(null);
  const [showCreate,       setShowCreate]        = useState(false);
  const [newForm,          setNewForm]           = useState(EMPTY_NEW);

  // Per-meeting notes (keyed by meeting id)
  const [notes, setNotes] = useState({}); // { [id]: { summary, decisions, actionText } }

  const selectedMeeting = meetings.find(m => m.id === selectedId) ?? null;
  const meetingNotes    = selectedId ? (notes[selectedId] ?? { summary: '', decisions: '', actionText: '' }) : null;

  const patchNotes = (patch) =>
    setNotes(prev => ({ ...prev, [selectedId]: { ...(prev[selectedId] ?? {}), ...patch } }));

  const handleCreateMeeting = (e) => {
    e.preventDefault();
    if (!newForm.title.trim() || !newForm.date) return;
    const m = { id: `m-${Date.now()}`, ...newForm, title: newForm.title.trim() };
    setMeetings(prev => [...prev, m]);
    setSelectedId(m.id);
    setShowCreate(false);
    setNewForm(EMPTY_NEW);
  };

  const handleSaveDraft = () => {
    if (!selectedMeeting || !meetingNotes?.actionText?.trim()) return;
    const lines = meetingNotes.actionText
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 2 && !l.startsWith('#'));
    const newItems = lines.map((title, i) => ({
      id:           `ai-${Date.now()}-${i}`,
      meetingId:    selectedMeeting.id,
      meetingTitle: selectedMeeting.title,
      meetingType:  selectedMeeting.type,
      title,
      summary:      meetingNotes.summary,
      decisions:    meetingNotes.decisions,
      teamId:       '',
      assigneeId:   '',
      priority:     'Medium',
      status:       'DRAFT',
    }));
    setPendingItems(prev => [...prev, ...newItems]);
    patchNotes({ actionText: '' });
  };

  const patchItem = (id, patch) =>
    setPendingItems(prev => prev.map(it => it.id === id ? { ...it, ...patch } : it));

  const handleApprove = (it) => {
    addTask({
      id:              `t${Date.now()}`,
      title:           it.title,
      description:     it.summary || '',
      assignedUserIds: it.assigneeId ? [it.assigneeId] : [],
      priority:        it.priority,
      column:          'To Do',
      meetingRequest:  null,
      blockedSince:    null,
      dueDate:         null,
      fromMeeting:     true,
    });
    patchItem(it.id, { status: 'APPROVED' });
  };

  const dismissItem = (id) => setPendingItems(prev => prev.filter(it => it.id !== id));

  const teamUsers = (teamId) => teamId
    ? USERS.filter(u => TEAMS.find(t => t.id === teamId)?.memberIds.includes(u.id))
    : [];

  const participantNames = (ids) =>
    ids.map(id => USERS.find(u => u.id === id)?.name).filter(Boolean).join(', ');

  const draftItems    = pendingItems.filter(it => it.status === 'DRAFT');
  const approvedItems = pendingItems.filter(it => it.status === 'APPROVED');

  return (
    <div className="p-6 max-w-6xl mx-auto flex flex-col gap-6">

      {/* Page header */}
      <div className="gp-wayfinder">
        <p className="text-xs font-semibold text-gp-fl3 uppercase tracking-widest mb-1">Meeting Notes</p>
        <h1 className="text-3xl font-bold text-gp-midnight">Convert notes into action</h1>
        <p className="text-sm text-gp-fl2 mt-1">Capture decisions and save follow-up action items for review.</p>
      </div>

      {/* Top two-column layout */}
      <div className="grid grid-cols-[280px_1fr] gap-5 items-start">

        {/* ── Left panel ── */}
        <div className="flex flex-col gap-4">

          {/* Select meeting */}
          <div className="bg-white rounded-2xl border border-[rgba(22,25,22,0.12)] p-5 flex flex-col gap-3">
            <p className="text-xs font-semibold text-gp-fl2 uppercase tracking-wide">Select meeting</p>

            {meetings.length > 0 ? (
              <select className={selectCls} value={selectedId ?? ''} onChange={e => setSelectedId(e.target.value || null)}>
                <option value="">— choose —</option>
                {meetings.map(m => (
                  <option key={m.id} value={m.id}>{m.title} — {m.date}</option>
                ))}
              </select>
            ) : (
              <p className="text-xs text-gp-fl3">No meetings yet.</p>
            )}

            <button
              onClick={() => setShowCreate(v => !v)}
              className="text-xs font-semibold text-gp-coral hover:text-gp-coral-dark transition-colors self-start"
            >
              {showCreate ? '− Cancel' : '+ New meeting'}
            </button>

            {/* Inline create form */}
            {showCreate && (
              <form onSubmit={handleCreateMeeting} className="flex flex-col gap-3 pt-2 border-t border-[rgba(22,25,22,0.08)]">
                <input className={inputCls} placeholder="Meeting title" required
                  value={newForm.title} onChange={e => setNewForm(p => ({ ...p, title: e.target.value }))} />
                <select className={selectCls} value={newForm.type} onChange={e => setNewForm(p => ({ ...p, type: e.target.value }))}>
                  {MEETING_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <input type="date" className={inputCls} required
                  value={newForm.date} onChange={e => setNewForm(p => ({ ...p, date: e.target.value }))} />
                <ParticipantPicker
                  selectedIds={newForm.participantIds}
                  onChange={ids => setNewForm(p => ({ ...p, participantIds: ids }))}
                />
                <button type="submit"
                  className="bg-gp-midnight hover:bg-gp-fl1 text-white text-xs rounded-lg px-4 py-2 font-semibold transition-colors disabled:opacity-40"
                  disabled={!newForm.title.trim() || !newForm.date}>
                  Create meeting
                </button>
              </form>
            )}
          </div>

          {/* Meeting info card */}
          {selectedMeeting && (
            <div className="bg-white rounded-2xl border border-[rgba(22,25,22,0.12)] p-5 flex flex-col gap-2">
              <p className="text-xs font-semibold text-gp-fl2 uppercase tracking-wide">Meeting summary</p>
              <p className="text-sm font-semibold text-gp-midnight">{selectedMeeting.title}</p>
              <p className="text-xs text-gp-fl3">Type: {selectedMeeting.type}</p>
              <p className="text-xs text-gp-fl3">{selectedMeeting.date}</p>
              {selectedMeeting.participantIds.length > 0 && (
                <p className="text-xs text-gp-fl3">
                  Participants: {participantNames(selectedMeeting.participantIds)}
                </p>
              )}
            </div>
          )}
        </div>

        {/* ── Right panel: note form ── */}
        <div className="bg-white rounded-2xl border border-[rgba(22,25,22,0.12)] p-6 flex flex-col gap-4">
          {!selectedMeeting ? (
            <p className="text-sm text-gp-fl2">Select or create a meeting to start taking notes.</p>
          ) : (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gp-fl2 uppercase tracking-wide">Meeting summary</label>
                <textarea className={`${inputCls} resize-none`} rows={4}
                  placeholder="What was discussed?"
                  value={meetingNotes?.summary ?? ''}
                  onChange={e => patchNotes({ summary: e.target.value })} />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gp-fl2 uppercase tracking-wide">Decisions made</label>
                <textarea className={`${inputCls} resize-none`} rows={3}
                  placeholder="Key decisions that were reached..."
                  value={meetingNotes?.decisions ?? ''}
                  onChange={e => patchNotes({ decisions: e.target.value })} />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gp-fl2 uppercase tracking-wide">Action items (one per line)</label>
                <textarea className={`${inputCls} resize-none font-mono`} rows={5}
                  placeholder={"Fix login bug\nUpdate documentation\nSchedule follow-up"}
                  value={meetingNotes?.actionText ?? ''}
                  onChange={e => patchNotes({ actionText: e.target.value })} />
              </div>

              <button
                onClick={handleSaveDraft}
                disabled={!meetingNotes?.actionText?.trim()}
                className="w-full bg-gp-coral hover:bg-gp-coral-dark disabled:opacity-40 text-white text-sm font-semibold rounded-xl py-3 transition-colors"
              >
                Save draft action items
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Pending action items ── */}
      {draftItems.length > 0 && (
        <div className="bg-white rounded-2xl border border-[rgba(22,25,22,0.12)] p-6 flex flex-col gap-4">
          <p className="text-sm font-bold text-gp-midnight">
            Pending action items
            <span className="ml-2 text-xs font-normal text-gp-fl3">({draftItems.length})</span>
          </p>

          {draftItems.map(it => {
            const users = teamUsers(it.teamId);
            return (
              <div key={it.id} className="border border-[rgba(22,25,22,0.12)] rounded-xl p-4 flex flex-col gap-3">
                {/* Title row */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gp-midnight">{it.title}</p>
                    <p className="text-xs text-gp-fl3 mt-0.5">From {it.meetingTitle}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs bg-gp-cream text-gp-fl2 font-medium px-2 py-0.5 rounded-full">
                      Status: {it.status}
                    </span>
                    <button onClick={() => dismissItem(it.id)}
                      className="text-gp-fl3 hover:text-gp-midnight text-base leading-none px-1 transition-colors">
                      ×
                    </button>
                  </div>
                </div>

                {/* Summary + Decisions */}
                {(it.summary || it.decisions) && (
                  <div className="grid grid-cols-2 gap-3">
                    {it.summary && (
                      <div className="bg-gp-sunrise rounded-lg px-3 py-2">
                        <p className="text-xs font-semibold text-gp-fl3 uppercase tracking-wide mb-1">Summary</p>
                        <p className="text-xs text-gp-fl1 line-clamp-3">{it.summary}</p>
                      </div>
                    )}
                    {it.decisions && (
                      <div className="bg-gp-sunrise rounded-lg px-3 py-2">
                        <p className="text-xs font-semibold text-gp-fl3 uppercase tracking-wide mb-1">Decisions</p>
                        <p className="text-xs text-gp-fl1 line-clamp-3">{it.decisions}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Assignment row */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Assign team */}
                  <select className="border border-[rgba(22,25,22,0.15)] rounded-lg px-3 py-1.5 text-xs text-gp-midnight bg-white focus:outline-none focus:ring-2 focus:ring-[#FF555F]/20 focus:border-gp-coral cursor-pointer"
                    value={it.teamId}
                    onChange={e => patchItem(it.id, { teamId: e.target.value, assigneeId: '' })}>
                    <option value="">Assign team</option>
                    {TEAMS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>

                  {/* Assign user */}
                  <select className="border border-[rgba(22,25,22,0.15)] rounded-lg px-3 py-1.5 text-xs text-gp-midnight bg-white focus:outline-none focus:ring-2 focus:ring-[#FF555F]/20 focus:border-gp-coral cursor-pointer"
                    value={it.assigneeId}
                    onChange={e => patchItem(it.id, { assigneeId: e.target.value })}
                    disabled={!it.teamId}>
                    <option value="">Assign user</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>

                  {/* Priority */}
                  <select className="border border-[rgba(22,25,22,0.15)] rounded-lg px-3 py-1.5 text-xs text-gp-midnight bg-white focus:outline-none focus:ring-2 focus:ring-[#FF555F]/20 focus:border-gp-coral cursor-pointer"
                    value={it.priority}
                    onChange={e => patchItem(it.id, { priority: e.target.value })}>
                    <option>Urgent</option>
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>

                  <button onClick={() => handleApprove(it)}
                    className="text-xs bg-green-600 hover:bg-green-700 text-white rounded-lg px-4 py-1.5 font-semibold transition-colors">
                    Approve as task
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Approved items (collapsed summary) */}
      {approvedItems.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-gp-fl3 uppercase tracking-widest">Approved Tasks</p>
          {approvedItems.map(it => (
            <div key={it.id} className="bg-white rounded-xl border border-[rgba(22,25,22,0.12)] px-4 py-3 flex items-center justify-between">
              <p className="text-sm font-medium text-gp-midnight">{it.title}</p>
              <span className="text-xs bg-green-100 text-green-700 font-medium px-2 py-0.5 rounded-full">Added to board</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
