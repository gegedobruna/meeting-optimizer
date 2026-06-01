import { useState } from 'react';
import { USERS, TEAMS } from '../data/mockData';
import { evaluateMeetingRequest, MEETING_REQUEST_STATUSES } from '../utils/meetingRules';
import { canScheduleMeeting } from '../utils/permissions';

const VERDICT_STYLE = {
  "Recommended":     "bg-green-50 text-green-800 border-green-200",
  "Optional":        "bg-amber-50 text-amber-800 border-amber-200",
  "Not Recommended": "bg-red-50 text-red-800 border-red-200",
};

const STATUS_BADGE = {
  PENDING:  "bg-slate-100 text-slate-600",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-600",
};

const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 transition';

// ─── Shared: Multi-team participant picker ────────────────────────────────────

function ParticipantPicker({ selectedIds, onToggleMember, onToggleTeam }) {
  return (
    <div className="flex flex-col gap-2 border border-slate-100 rounded-xl p-4 bg-slate-50">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
        Participants
        {selectedIds.length > 0 && (
          <span className="ml-2 normal-case font-normal text-slate-400">
            ({selectedIds.length} selected)
          </span>
        )}
      </p>

      {TEAMS.map(team => {
        const members      = USERS.filter(u => team.memberIds.includes(u.id));
        const allSelected  = members.every(u => selectedIds.includes(u.id));
        const someSelected = members.some(u => selectedIds.includes(u.id));
        return (
          <div key={team.id} className="flex flex-col gap-2">
            {/* Team header row */}
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-600">{team.name}</p>
              <button
                type="button"
                onClick={() => onToggleTeam(team)}
                className={`text-xs px-2 py-0.5 rounded-full font-medium border transition-colors ${
                  allSelected
                    ? 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200'
                    : someSelected
                    ? 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {allSelected ? 'Deselect all' : 'Select all'}
              </button>
            </div>
            {/* Member chips */}
            <div className="flex flex-wrap gap-2">
              {members.map(u => {
                const active = selectedIds.includes(u.id);
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => onToggleMember(u.id)}
                    title={u.title}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      active
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-400 border-slate-200 opacity-50'
                    }`}
                  >
                    <span>{u.avatar}</span>
                    <span>{u.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      <p className="text-xs text-slate-400 mt-1">Click a chip to toggle · use "Select all" per team</p>
    </div>
  );
}

// ─── Team Member: Request flow ────────────────────────────────────────────────

const EMPTY_REQUEST_FORM = {
  title: '', participantIds: [],
  estimatedMinutes: 30,
  hasBlocker: false, hasDecision: false, hasUpdate: false, alternativeExists: false,
};

function RequestForm({ currentUser, meetingRequests, setMeetingRequests }) {
  const [form,      setForm]      = useState(EMPTY_REQUEST_FORM);
  const [submitted, setSubmitted] = useState(false);

  const verdictInput = { ...form, participantCount: form.participantIds.length };
  const verdict      = evaluateMeetingRequest(verdictInput);
  const toggle       = (field) => setForm(prev => ({ ...prev, [field]: !prev[field] }));

  const handleToggleMember = (userId) => {
    setForm(prev => ({
      ...prev,
      participantIds: prev.participantIds.includes(userId)
        ? prev.participantIds.filter(id => id !== userId)
        : [...prev.participantIds, userId],
    }));
  };

  const handleToggleTeam = (team) => {
    const memberIds = USERS.filter(u => team.memberIds.includes(u.id)).map(u => u.id);
    const allSelected = memberIds.every(id => form.participantIds.includes(id));
    setForm(prev => ({
      ...prev,
      participantIds: allSelected
        ? prev.participantIds.filter(id => !memberIds.includes(id))
        : [...new Set([...prev.participantIds, ...memberIds])],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setMeetingRequests(prev => [...prev, {
      id:            `mr-${Date.now()}`,
      title:         form.title.trim(),
      requesterId:   currentUser.id,
      requesterName: currentUser.name,
      params:        {
        participantIds:  form.participantIds,
        participantCount: form.participantIds.length,
        estimatedMinutes: form.estimatedMinutes,
      },
      verdict:       verdict.verdict,
      reasons:       verdict.reasons,
      status:        MEETING_REQUEST_STATUSES.PENDING,
      createdAt:     new Date().toISOString(),
      scheduledDate: null,
    }]);
    setForm(EMPTY_REQUEST_FORM);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const myRequests = meetingRequests.filter(r => r.requesterId === currentUser.id);

  return (
    <div className="flex flex-col gap-6">
      {/* Form */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">New Request</p>
          <h2 className="text-xl font-bold text-slate-900">Request a Meeting</h2>
          <p className="text-sm text-slate-500">Your request will be reviewed by a team lead.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Meeting title</label>
            <input className={inputCls} placeholder="e.g. Sprint blocker resolution"
              value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Duration (min)</label>
            <input type="number" min={5} max={480} className={inputCls}
              value={form.estimatedMinutes} onChange={e => setForm(p => ({ ...p, estimatedMinutes: +e.target.value }))} />
          </div>

          <ParticipantPicker
            selectedIds={form.participantIds}
            onToggleMember={handleToggleMember}
            onToggleTeam={handleToggleTeam}
          />

          <div className="flex flex-col gap-2">
            {[
              { field: 'hasBlocker',        label: 'There is an active blocker that needs resolving' },
              { field: 'hasDecision',       label: 'A group decision needs to be made' },
              { field: 'hasUpdate',         label: 'This is primarily a status update' },
              { field: 'alternativeExists', label: 'An async alternative already exists' },
            ].map(({ field, label }) => (
              <label key={field} className="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer select-none">
                <input type="checkbox" checked={form[field]} onChange={() => toggle(field)} className="rounded" />
                {label}
              </label>
            ))}
          </div>

          {/* Verdict */}
          <div className={`border rounded-xl px-4 py-3 text-sm ${VERDICT_STYLE[verdict.verdict]}`}>
            <p className="font-semibold mb-1">{verdict.verdict}</p>
            <ul className="list-disc list-inside space-y-0.5 text-xs opacity-80">
              {verdict.reasons.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </div>

          <div className="flex items-center gap-3">
            <button type="submit"
              className="bg-slate-900 hover:bg-slate-700 text-white text-sm rounded-lg px-5 py-2.5 font-semibold transition-colors disabled:opacity-40"
              disabled={!form.title.trim()}>
              Submit Request
            </button>
            {submitted && <span className="text-green-600 text-sm font-medium">Request submitted!</span>}
          </div>
        </form>
      </div>

      {/* My requests */}
      {myRequests.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Your Requests</p>
          {myRequests.map(r => (
            <div key={r.id} className="bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-800">{r.title}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[r.status]}`}>{r.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Team Lead / Admin: Schedule + manage requests ────────────────────────────

const EMPTY_SCHEDULE_FORM = {
  title: '', participantIds: [],
  durationMins: 30, scheduledDate: '', scheduledTime: '09:00',
};

function ScheduleForm({ currentUser, meetingRequests, setMeetingRequests }) {
  const [form,      setForm]      = useState(EMPTY_SCHEDULE_FORM);
  const [scheduled, setScheduled] = useState(false);
  const [dates,     setDates]     = useState({});

  const handleToggleMember = (userId) => {
    setForm(prev => ({
      ...prev,
      participantIds: prev.participantIds.includes(userId)
        ? prev.participantIds.filter(id => id !== userId)
        : [...prev.participantIds, userId],
    }));
  };

  const handleToggleTeam = (team) => {
    const memberIds = USERS.filter(u => team.memberIds.includes(u.id)).map(u => u.id);
    const allSelected = memberIds.every(id => form.participantIds.includes(id));
    setForm(prev => ({
      ...prev,
      participantIds: allSelected
        ? prev.participantIds.filter(id => !memberIds.includes(id))
        : [...new Set([...prev.participantIds, ...memberIds])],
    }));
  };

  const handleSchedule = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.scheduledDate) return;
    const iso = `${form.scheduledDate}T${form.scheduledTime}:00.000Z`;
    setMeetingRequests(prev => [...prev, {
      id:            `mr-${Date.now()}`,
      title:         form.title.trim(),
      requesterId:   currentUser.id,
      requesterName: currentUser.name,
      params:        {
        participantIds:   form.participantIds,
        participantCount: form.participantIds.length,
        durationMins:     form.durationMins,
      },
      verdict:       'Recommended',
      reasons:       ['Scheduled directly by team lead'],
      status:        MEETING_REQUEST_STATUSES.APPROVED,
      createdAt:     new Date().toISOString(),
      scheduledDate: iso,
    }]);
    setForm(EMPTY_SCHEDULE_FORM);
    setScheduled(true);
    setTimeout(() => setScheduled(false), 3000);
  };

  const updateStatus = (id, status) => {
    setMeetingRequests(prev =>
      prev.map(r => r.id === id ? { ...r, status, scheduledDate: dates[id] ?? r.scheduledDate } : r)
    );
  };

  const pending = meetingRequests.filter(r => r.status === MEETING_REQUEST_STATUSES.PENDING);
  const others  = meetingRequests.filter(r => r.status !== MEETING_REQUEST_STATUSES.PENDING);

  return (
    <div className="flex flex-col gap-6">

      {/* Schedule form */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col gap-5">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-0.5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Direct Schedule</p>
            <h2 className="text-xl font-bold text-slate-900">Schedule a Meeting</h2>
            <p className="text-sm text-slate-500">As a team lead, your meetings are approved instantly.</p>
          </div>
          <span className="text-xs bg-green-100 text-green-700 font-semibold px-2.5 py-1 rounded-full">Auto-approved</span>
        </div>

        <form onSubmit={handleSchedule} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Meeting title</label>
            <input className={inputCls} placeholder="e.g. Sprint planning · Q2 review"
              value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</label>
              <input type="date" className={inputCls}
                value={form.scheduledDate} onChange={e => setForm(p => ({ ...p, scheduledDate: e.target.value }))} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Time</label>
              <input type="time" className={inputCls}
                value={form.scheduledTime} onChange={e => setForm(p => ({ ...p, scheduledTime: e.target.value }))} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Duration (min)</label>
            <input type="number" min={5} max={480} className={inputCls}
              value={form.durationMins} onChange={e => setForm(p => ({ ...p, durationMins: +e.target.value }))} />
          </div>

          <ParticipantPicker
            selectedIds={form.participantIds}
            onToggleMember={handleToggleMember}
            onToggleTeam={handleToggleTeam}
          />

          <div className="flex items-center gap-3">
            <button type="submit"
              className="bg-slate-900 hover:bg-slate-700 text-white text-sm rounded-lg px-5 py-2.5 font-semibold transition-colors disabled:opacity-40"
              disabled={!form.title.trim() || !form.scheduledDate}>
              Schedule Meeting
            </button>
            {scheduled && <span className="text-green-600 text-sm font-medium">Meeting scheduled!</span>}
          </div>
        </form>
      </div>

      {/* Pending requests to review */}
      {pending.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
            Pending Requests ({pending.length})
          </p>
          {pending.map(r => {
            const participantNames = (r.params?.participantIds ?? [])
              .map(id => USERS.find(u => u.id === id)?.name)
              .filter(Boolean);
            return (
              <div key={r.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{r.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      by {r.requesterName}
                      {participantNames.length > 0 && ` · ${participantNames.length} participants`}
                      {r.params?.estimatedMinutes && ` · ${r.params.estimatedMinutes} min`}
                    </p>
                    {participantNames.length > 0 && (
                      <p className="text-xs text-slate-400 mt-0.5">{participantNames.join(', ')}</p>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${STATUS_BADGE[r.status]}`}>
                    {r.status}
                  </span>
                </div>

                <div className={`border rounded-lg px-3 py-2 text-xs ${VERDICT_STYLE[r.verdict]}`}>
                  <span className="font-semibold">{r.verdict}</span>{' — '}
                  {r.reasons.join(' ')}
                </div>

                <div className="flex gap-2 items-center flex-wrap">
                  <input type="date"
                    className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    value={dates[r.id] ?? ''}
                    onChange={e => setDates(prev => ({ ...prev, [r.id]: e.target.value || null }))}
                  />
                  <button onClick={() => updateStatus(r.id, MEETING_REQUEST_STATUSES.APPROVED)}
                    className="text-xs bg-green-600 hover:bg-green-700 text-white rounded-lg px-3 py-1.5 font-semibold transition-colors">
                    Approve
                  </button>
                  <button onClick={() => updateStatus(r.id, MEETING_REQUEST_STATUSES.REJECTED)}
                    className="text-xs bg-red-500 hover:bg-red-600 text-white rounded-lg px-3 py-1.5 font-semibold transition-colors">
                    Reject
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Resolved meetings */}
      {others.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">All Meetings</p>
          {others.map(r => (
            <div key={r.id} className="bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{r.title}</p>
                {r.scheduledDate && (
                  <p className="text-xs text-slate-400 mt-0.5">
                    {new Date(r.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    {' · '}
                    {new Date(r.scheduledDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                  </p>
                )}
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${STATUS_BADGE[r.status]}`}>
                {r.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function MeetingRequests({ currentUser, meetingRequests, setMeetingRequests }) {
  const isScheduler = canScheduleMeeting(currentUser);

  return (
    <div className="p-6 max-w-3xl mx-auto flex flex-col gap-6">
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">
          {isScheduler ? 'Team Lead' : 'Team Member'}
        </p>
        <h1 className="text-3xl font-bold text-slate-900">
          {isScheduler ? 'Meeting Scheduler' : 'Meeting Requests'}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {isScheduler
            ? 'Schedule meetings directly or review requests from your team.'
            : 'Submit a meeting request and track its approval status.'}
        </p>
      </div>

      {isScheduler
        ? <ScheduleForm currentUser={currentUser} meetingRequests={meetingRequests} setMeetingRequests={setMeetingRequests} />
        : <RequestForm  currentUser={currentUser} meetingRequests={meetingRequests} setMeetingRequests={setMeetingRequests} />
      }
    </div>
  );
}
