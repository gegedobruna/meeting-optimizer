const blockerHours = (task) =>
  task.blockedSince ? (Date.now() - new Date(task.blockedSince).getTime()) / 3_600_000 : 0;

const formatDue = (dueDate) => {
  if (!dueDate) return 'No due date';
  return 'Due ' + new Date(dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export default function AgendaPanel({ tasks, showAgenda, setShowAgenda }) {
  const blocked   = tasks.filter(t => t.column === 'Blocked');
  const inReview  = tasks.filter(t => t.column === 'Review' || t.column === 'Done').length;
  const escalated = blocked.filter(t => blockerHours(t) >= 24).length;

  // Collapsed state — small tab on the right edge
  if (!showAgenda) {
    return (
      <button
        onClick={() => setShowAgenda(true)}
        className="fixed top-1/2 -translate-y-1/2 right-0 z-20 bg-white border border-gray-200 border-r-0 shadow-md rounded-l-lg px-2 py-3 flex flex-col items-center gap-1 text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-colors"
      >
        <span className="text-xs font-semibold [writing-mode:vertical-rl] rotate-180 tracking-wide">Meeting Agenda</span>
        <span className="text-xs">›</span>
      </button>
    );
  }

  return (
    <div className="fixed top-0 right-0 h-full w-72 bg-white border-l border-gray-100 shadow-xl z-10 overflow-y-auto flex flex-col gap-6 pt-6 px-5 pb-5">

      {/* Header + close button */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-900">Meeting agenda</h2>
          <p className="text-xs text-gray-400 mt-0.5">Quick view of blockers and suggested syncs.</p>
        </div>
        <button
          onClick={() => setShowAgenda(false)}
          className="text-gray-400 hover:text-gray-700 text-lg leading-none ml-2 mt-0.5 shrink-0"
          title="Hide agenda"
        >
          ‹
        </button>
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
