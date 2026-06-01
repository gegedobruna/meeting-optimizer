import { useState, useMemo } from 'react';
import { USERS, TEAMS } from '../data/mockData';
import { getActiveTaskCount } from '../utils/users';

const PRIORITY_STYLES = {
  Urgent: 'bg-red-50 text-red-600 border-red-200',
  High:   'bg-amber-50 text-amber-600 border-amber-200',
  Medium: 'bg-blue-50 text-blue-600 border-blue-200',
  Low:    'bg-slate-50 text-slate-500 border-slate-200',
};

const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition';

export default function AddTaskModal({ columnName, tasks, onAdd, onClose }) {
  const [title,       setTitle]       = useState('');
  const [description, setDescription] = useState('');
  const [priority,    setPriority]    = useState('Medium');
  const [dueDate,     setDueDate]     = useState('');
  const [teamId,      setTeamId]      = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  const selectedTeam = TEAMS.find(t => t.id === teamId) ?? null;
  const teamMembers  = selectedTeam ? USERS.filter(u => selectedTeam.memberIds.includes(u.id)) : [];

  const handleTeamChange = (newTeamId) => {
    setTeamId(newTeamId);
    if (newTeamId) {
      const team = TEAMS.find(t => t.id === newTeamId);
      setSelectedIds(team ? [...team.memberIds] : []);
    } else {
      setSelectedIds([]);
    }
  };

  const toggleMember = (userId) => {
    setSelectedIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const suggested = useMemo(() => {
    if (teamMembers.length === 0) return null;
    return teamMembers.reduce((best, u) => {
      return getActiveTaskCount(u.id, tasks) < getActiveTaskCount(best.id, tasks) ? u : best;
    }, teamMembers[0]);
  }, [teamMembers, tasks]);

  const handleSubmit = () => {
    if (!title.trim()) return;
    onAdd({
      id:              `t${Date.now()}`,
      title:           title.trim(),
      description:     description.trim(),
      assignedUserIds: selectedIds,
      priority,
      column:          columnName,
      meetingRequest:  null,
      blockedSince:    null,
      dueDate:         dueDate || null,
      fromMeeting:     false,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col overflow-hidden border border-slate-100">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">New Task</p>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">{columnName}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors text-lg leading-none"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-4 overflow-y-auto max-h-[70vh]">

          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Title</label>
            <input
              className={inputCls}
              placeholder="What needs to be done?"
              value={title}
              onChange={e => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Description</label>
            <textarea
              className={`${inputCls} resize-none`}
              placeholder="Add more context..."
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          {/* Priority + Due Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Priority</label>
              <select
                className={`${inputCls} cursor-pointer`}
                value={priority}
                onChange={e => setPriority(e.target.value)}
              >
                {Object.keys(PRIORITY_STYLES).map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Due Date</label>
              <input
                type="date"
                className={inputCls}
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
              />
            </div>
          </div>

          {/* Assigned Team */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Assigned Team</label>
            <select
              className={`${inputCls} cursor-pointer`}
              value={teamId}
              onChange={e => handleTeamChange(e.target.value)}
            >
              <option value="">— No team —</option>
              {TEAMS.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          {/* Member chips */}
          {selectedTeam && (
            <div className="flex flex-col gap-3 border border-slate-100 rounded-xl p-4 bg-slate-50">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Assigned Members</p>
              <div className="flex flex-wrap gap-2">
                {teamMembers.map(u => {
                  const active = selectedIds.includes(u.id);
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => toggleMember(u.id)}
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
              {suggested && (
                <p className="text-xs text-slate-400">
                  Suggested assignee:{' '}
                  <span className="font-medium text-slate-600">{suggested.name}</span>
                  {' '}— {getActiveTaskCount(suggested.id, tasks)} active task(s)
                </p>
              )}
              <p className="text-xs text-slate-400 -mt-1">
                All members auto-selected · click a chip to remove
              </p>
            </div>
          )}

          {/* Priority preview */}
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${PRIORITY_STYLES[priority]}`}>
              {priority} priority
            </span>
            <span className="text-xs text-slate-400">· {columnName}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100 bg-slate-50">
          <button
            className="text-slate-500 text-sm font-medium px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="bg-slate-900 hover:bg-slate-700 text-white rounded-lg px-5 py-2 text-sm font-semibold disabled:opacity-40 transition-colors"
            onClick={handleSubmit}
            disabled={!title.trim()}
          >
            Add Task
          </button>
        </div>
      </div>
    </div>
  );
}
