import { useState, useMemo } from 'react';
import { USERS, TEAMS } from '../data/mockData';
import { getActiveTaskCount } from '../utils/users';

export default function AddTaskModal({ columnName, tasks, onAdd, onClose }) {
  const [title,      setTitle]      = useState('');
  const [priority,   setPriority]   = useState('Medium');
  const [teamId,     setTeamId]     = useState('');
  const [assigneeId, setAssigneeId] = useState('');

  // Users visible in the assignee dropdown — filtered to team when one is selected
  const visibleUsers = useMemo(() => {
    if (!teamId) return USERS;
    const team = TEAMS.find(t => t.id === teamId);
    return team ? USERS.filter(u => team.memberIds.includes(u.id)) : USERS;
  }, [teamId]);

  // Capacity rows — only computed when a team is selected
  const capacityRows = useMemo(() => {
    if (!teamId) return [];
    return visibleUsers
      .map(u => ({ user: u, active: getActiveTaskCount(u.id, tasks) }))
      .sort((a, b) => a.active - b.active);
  }, [teamId, visibleUsers, tasks]);

  const minActive = capacityRows.length > 0 ? capacityRows[0].active : null;

  const handleTeamChange = (newTeamId) => {
    setTeamId(newTeamId);
    setAssigneeId(''); // reset selection when team changes
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({
      id:              `t${Date.now()}`,
      title:           title.trim(),
      assignedUserIds: assigneeId ? [assigneeId] : [],
      priority,
      column:          columnName,
      meetingRequest:  null,
      description:     "",
      blockedSince:    null,
      dueDate:         null,
      fromMeeting:     false,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md flex flex-col gap-3">
        <h3 className="font-bold text-lg">Add Task to {columnName}</h3>

        {/* Title */}
        <input
          className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
          placeholder="Task title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          autoFocus
        />

        {/* Priority */}
        <select
          className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
          value={priority}
          onChange={e => setPriority(e.target.value)}
        >
          <option value="Urgent">Urgent</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        {/* Team filter */}
        <select
          className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
          value={teamId}
          onChange={e => handleTeamChange(e.target.value)}
        >
          <option value="">All users — no team filter</option>
          {TEAMS.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>

        {/* Assignee */}
        <select
          className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
          value={assigneeId}
          onChange={e => setAssigneeId(e.target.value)}
        >
          <option value="">Unassigned</option>
          {visibleUsers.map(u => (
            <option key={u.id} value={u.id}>{u.name} — {u.title}</option>
          ))}
        </select>

        {/* Capacity snapshot panel — only when a team is selected */}
        {capacityRows.length > 0 && (
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex flex-col gap-1.5">
            <p className="text-xs font-semibold text-blue-700 mb-0.5">
              Capacity Snapshot — {TEAMS.find(t => t.id === teamId)?.name}
            </p>
            {capacityRows.map(({ user: u, active }) => (
              <div
                key={u.id}
                onClick={() => setAssigneeId(u.id)}
                className={`flex items-center gap-2 text-xs px-2 py-1.5 rounded cursor-pointer transition-colors ${
                  assigneeId === u.id
                    ? 'bg-blue-200 text-blue-900'
                    : 'hover:bg-blue-100 text-gray-700'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-bold leading-none shrink-0">
                  {u.avatar}
                </span>
                <span className="flex-1 font-medium truncate">{u.name}</span>
                <span className="text-gray-400 shrink-0">{active} active</span>
                {active === minActive && (
                  <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium shrink-0">
                    Recommended
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-2 mt-2">
          <button
            className="text-gray-500 text-sm font-medium px-4 py-2"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="bg-gray-900 text-white rounded px-4 py-2 text-sm font-medium disabled:opacity-40"
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
