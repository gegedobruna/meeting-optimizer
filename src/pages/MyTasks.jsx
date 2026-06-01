import { useState } from 'react';
import { COLUMNS, TEAMS } from '../data/mockData';
import TaskDetailModal from '../components/TaskDetailModal';
import { getUsersByIds } from '../utils/users';

const PRIORITY_COLOR = {
  Urgent: 'text-red-500',
  High:   'text-blue-500',
  Medium: 'text-amber-500',
  Low:    'text-slate-400',
};

const STATUS_COLOR = {
  Backlog:      'text-slate-400',
  'To Do':      'text-blue-400',
  'In Progress':'text-indigo-500',
  Blocked:      'text-red-500',
  Review:       'text-amber-500',
  Done:         'text-green-500',
};

const ESTIMATED = {
  Urgent: '12 hrs',
  High:   '8 hrs',
  Medium: '4 hrs',
  Low:    '2 hrs',
};

const escalationLabel = (task) => {
  if (task.column !== 'Blocked' || !task.blockedSince) return null;
  const h = (Date.now() - new Date(task.blockedSince).getTime()) / 3_600_000;
  if (h > 72) return { text: '⚠ 72h+', cls: 'text-red-600' };
  if (h > 48) return { text: '⚠ 48h+', cls: 'text-orange-500' };
  if (h > 24) return { text: '⚠ 24h+', cls: 'text-yellow-500' };
  return null;
};

const formatDue = (dueDate) => {
  if (!dueDate) return '—';
  return new Date(dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getTeamName = (assignedUserIds) => {
  if (!assignedUserIds?.length) return null;
  return TEAMS.find(t => t.memberIds.includes(assignedUserIds[0]))?.name ?? null;
};

const selectCls = 'border border-[rgba(22,25,22,0.15)] rounded-lg px-3 py-1.5 text-sm text-gp-midnight bg-white focus:outline-none focus:ring-2 focus:ring-[#FF555F]/20 focus:border-gp-coral cursor-pointer transition';

export default function MyTasks({ currentUser, tasks, saveTask, deleteTask }) {
  const [statusFilter,   setStatusFilter]   = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [selectedTask,   setSelectedTask]   = useState(null);

  const myTasks = tasks.filter(t => t.assignedUserIds?.includes(currentUser.id));

  const filtered = myTasks.filter(t => {
    if (statusFilter   !== 'All' && t.column   !== statusFilter)   return false;
    if (priorityFilter !== 'All' && t.priority !== priorityFilter) return false;
    return true;
  });

  const handleStatusChange = (task, newColumn) => {
    saveTask({ ...task, column: newColumn });
  };

  return (
    <div className="p-6 max-w-5xl mx-auto flex flex-col gap-6">

      {/* Page header */}
      <div className="gp-wayfinder">
        <p className="text-xs font-semibold text-gp-fl3 uppercase tracking-widest mb-1">Personal Tasks</p>
        <h1 className="text-3xl font-bold text-gp-midnight">My tasks</h1>
        <p className="text-sm text-gp-fl2 mt-1">Work on your assigned items and keep meeting follow-ups visible.</p>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gp-fl2 font-medium">Status</span>
          <select className={selectCls} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="All">All</option>
            {COLUMNS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gp-fl2 font-medium">Priority</span>
          <select className={selectCls} value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
            <option value="All">All</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
        <span className="ml-auto text-xs text-gp-fl3">
          {filtered.length} task{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Task list */}
      {filtered.length === 0 ? (
        <p className="text-sm text-gp-fl2">No tasks match the selected filters.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(task => {
            const esc       = escalationLabel(task);
            const assignees = getUsersByIds(task.assignedUserIds ?? []);
            const teamName  = getTeamName(task.assignedUserIds);

            return (
              <div
                key={task.id}
                onClick={() => setSelectedTask(task)}
                className="bg-white rounded-xl border border-[rgba(22,25,22,0.12)] p-5 flex flex-col gap-4 cursor-pointer hover:shadow-md transition-shadow"
              >
                {/* Top row: title + badges */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-base text-gp-midnight">{task.title}</p>
                      {esc && <span className={`text-xs font-semibold ${esc.cls}`}>{esc.text}</span>}
                      {task.fromMeeting && (
                        <span className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full font-medium">
                          From Meeting
                        </span>
                      )}
                    </div>
                    {task.description && (
                      <p className="text-sm text-gp-fl2 mt-1 line-clamp-1">{task.description}</p>
                    )}
                  </div>
                  {/* Right-side plain-text badges */}
                  <div className="flex items-center gap-3 shrink-0 text-sm">
                    <span className={STATUS_COLOR[task.column] ?? 'text-slate-400'}>{task.column}</span>
                    <span className={PRIORITY_COLOR[task.priority] ?? 'text-slate-400'}>{task.priority}</span>
                    {teamName && <span className="text-gp-fl2">{teamName}</span>}
                  </div>
                </div>

                {/* Metadata row */}
                <div className="grid grid-cols-3 gap-4 border-t border-[rgba(22,25,22,0.06)] pt-4">
                  <div>
                    <p className="text-xs font-semibold text-gp-fl3 uppercase tracking-wide mb-1">Due Date</p>
                    <p className="text-sm text-gp-fl1">{formatDue(task.dueDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gp-fl3 uppercase tracking-wide mb-1">Assigned Users</p>
                    <p className="text-sm text-gp-fl1">
                      {assignees.length === 0 ? '—' : assignees.map(u => u.name).join(', ')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gp-fl3 uppercase tracking-wide mb-1">Estimated</p>
                    <p className="text-sm text-gp-fl1">{ESTIMATED[task.priority] ?? '—'}</p>
                  </div>
                </div>

                {/* Update status row */}
                <div
                  className="flex items-center gap-2"
                  onClick={e => e.stopPropagation()}
                >
                  <span className="text-xs text-gp-fl3 font-medium">Update status</span>
                  <select
                    className={selectCls}
                    value={task.column}
                    onChange={e => handleStatusChange(task, e.target.value)}
                  >
                    {COLUMNS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          currentUser={currentUser}
          onClose={() => setSelectedTask(null)}
          onSave={(updated) => { saveTask(updated); setSelectedTask(null); }}
          onDelete={(id) => { deleteTask(id); setSelectedTask(null); }}
        />
      )}
    </div>
  );
}
