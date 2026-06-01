import { getUsersByIds } from '../utils/users';

const blockerHours = (task) =>
  task.blockedSince ? (Date.now() - new Date(task.blockedSince).getTime()) / 3_600_000 : 0;

const formatDue = (dueDate) => {
  if (!dueDate) return 'No due date';
  return 'Due ' + new Date(dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export default function AgendaPanel({ tasks }) {
  const blocked    = tasks.filter(t => t.column === 'Blocked');
  const inReview   = tasks.filter(t => t.column === 'Review' || t.column === 'Done').length;
  const escalated  = blocked.filter(t => blockerHours(t) >= 24).length;

  return (
    <div className="fixed top-0 right-0 h-full w-72 bg-white border-l border-gray-100 shadow-xl p-5 z-10 overflow-y-auto pt-6 flex flex-col gap-6">

      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-gray-900">Meeting agenda</h2>
        <p className="text-xs text-gray-400 mt-0.5">Quick view of blockers and suggested syncs.</p>
      </div>

      {/* Progress */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Progress</p>
        <p className="text-3xl font-bold text-gray-900">{inReview}/{tasks.length}</p>
        <p className="text-xs text-gray-400 mt-0.5">Tasks in review or done</p>
      </div>

      {/* Blocker summary */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Blocker Summary</p>
        <p className="text-3xl font-bold text-gray-900">{blocked.length}</p>
        <p className="text-xs text-gray-400 mt-0.5">Blocked tasks currently needing attention</p>
      </div>

      {/* Escalated blockers */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Escalated Blockers</p>
        <p className="text-3xl font-bold text-gray-900">{escalated}</p>
        <p className="text-xs text-gray-400 mt-0.5">Tasks blocked for 24+ hours</p>
      </div>

      {/* Blocked task watchlist */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-2">Blocked task watchlist</p>
        {blocked.length === 0 ? (
          <p className="text-xs text-gray-400">No blocked tasks.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {blocked.map(task => {
              const assigneeCount = (task.assignedUserIds ?? []).length;
              return (
                <div key={task.id} className="bg-gray-50 rounded-lg p-3 flex flex-col gap-0.5">
                  <p className="text-sm font-semibold text-gray-800 leading-snug">{task.title}</p>
                  <p className="text-xs text-gray-400">{assigneeCount} assignee{assigneeCount !== 1 ? 's' : ''}</p>
                  <p className="text-xs text-gray-400">{formatDue(task.dueDate)}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
