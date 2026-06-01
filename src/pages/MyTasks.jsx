import { useState } from 'react';
import { COLUMNS } from '../data/mockData';
import TaskDetailModal from '../components/TaskDetailModal';
import { getUsersByIds } from '../utils/users';

const COLUMN_BADGE = {
  "Backlog":     "bg-gray-100 text-gray-600",
  "To Do":       "bg-blue-100 text-blue-700",
  "In Progress": "bg-indigo-100 text-indigo-700",
  "Blocked":     "bg-red-100 text-red-700",
  "Review":      "bg-yellow-100 text-yellow-700",
  "Done":        "bg-green-100 text-green-700",
};

const PRIORITY_BADGE = {
  High:   "bg-red-100 text-red-700",
  Medium: "bg-yellow-100 text-yellow-700",
  Low:    "bg-blue-100 text-blue-700",
};

const escalationLabel = (task) => {
  if (task.column !== "Blocked" || !task.blockedSince) return null;
  const h = (Date.now() - new Date(task.blockedSince).getTime()) / 3_600_000;
  if (h > 72) return { text: "⚠ 72h+", cls: "text-red-600" };
  if (h > 48) return { text: "⚠ 48h+", cls: "text-orange-600" };
  if (h > 24) return { text: "⚠ 24h+", cls: "text-yellow-600" };
  return null;
};

export default function MyTasks({ currentUser, tasks, saveTask, deleteTask }) {
  const [statusFilter,   setStatusFilter]   = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [selectedTask,   setSelectedTask]   = useState(null);

  const myTasks = tasks.filter(t => t.assignedUserIds?.includes(currentUser.id));

  const filtered = myTasks.filter(t => {
    if (statusFilter   !== "All" && t.column   !== statusFilter)   return false;
    if (priorityFilter !== "All" && t.priority !== priorityFilter) return false;
    return true;
  });

  return (
    <div className="p-6 max-w-3xl mx-auto flex flex-col gap-5">
      <h2 className="text-lg font-semibold text-gray-800">My Tasks</h2>

      {/* Filter bar */}
      <div className="flex gap-3 items-center">
        <select
          className="border border-gray-200 rounded px-3 py-1.5 text-sm"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="All">All Statuses</option>
          {COLUMNS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          className="border border-gray-200 rounded px-3 py-1.5 text-sm"
          value={priorityFilter}
          onChange={e => setPriorityFilter(e.target.value)}
        >
          <option value="All">All Priorities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
        <span className="text-xs text-gray-400 ml-auto">
          {filtered.length} task{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Task rows */}
      {filtered.length === 0 ? (
        <p className="text-sm text-gray-400">No tasks match the selected filters.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map(task => {
            const esc = escalationLabel(task);
            return (
              <div
                key={task.id}
                onClick={() => setSelectedTask(task)}
                className="bg-white rounded-lg shadow-sm px-4 py-3 flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{task.title}</p>
                  {esc && <span className={`text-xs font-semibold ${esc.cls}`}>{esc.text}</span>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {task.fromMeeting && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-medium">
                      From Meeting
                    </span>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${COLUMN_BADGE[task.column] ?? 'bg-gray-100 text-gray-600'}`}>
                    {task.column}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_BADGE[task.priority] ?? 'bg-gray-100 text-gray-600'}`}>
                    {task.priority}
                  </span>
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
