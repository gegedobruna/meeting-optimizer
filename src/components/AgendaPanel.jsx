import { TEAMS, USERS, WORKER_WIP_LIMIT } from '../data/mockData';

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

  // Per-user In Progress count for team capacity
  const countByUser = {};
  tasks.filter(t => t.column === 'In Progress').forEach(t => {
    (t.assignedUserIds ?? []).forEach(uid => {
      countByUser[uid] = (countByUser[uid] ?? 0) + 1;
    });
  });

  const teamCapacity = TEAMS.map(team => {
    const members     = team.memberIds.map(id => ({ id, count: countByUser[id] ?? 0 }));
    const totalUsed   = members.reduce((s, m) => s + m.count, 0);
    const totalMax    = members.length * WORKER_WIP_LIMIT;
    const overloaded  = members.filter(m => m.count > WORKER_WIP_LIMIT).length;
    return { team, totalUsed, totalMax, overloaded };
  });

  // Collapsed state — small tab on the right edge
  if (!showAgenda) {
    return (
      <button
        onClick={() => setShowAgenda(true)}
        className="fixed top-1/2 -translate-y-1/2 right-0 z-20 bg-white border border-[rgba(22,25,22,0.12)] border-r-0 shadow-md rounded-l-lg px-2 py-3 flex flex-col items-center gap-1 text-gp-fl2 hover:text-gp-midnight hover:bg-gp-sunrise transition-colors"
      >
        <span className="text-xs font-semibold [writing-mode:vertical-rl] rotate-180 tracking-wide">Meeting Agenda</span>
        <span className="text-xs">›</span>
      </button>
    );
  }

  return (
    <div className="fixed top-0 right-0 h-full w-72 bg-white border-l border-[rgba(22,25,22,0.08)] shadow-xl z-10 overflow-y-auto flex flex-col gap-6 pt-6 px-5 pb-5">

      {/* Header + close button */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-bold text-gp-midnight">Meeting agenda</h2>
          <p className="text-xs text-gp-fl3 mt-0.5">Quick view of blockers and suggested syncs.</p>
        </div>
        <button
          onClick={() => setShowAgenda(false)}
          className="text-gp-fl3 hover:text-gp-midnight text-lg leading-none ml-2 mt-0.5 shrink-0"
          title="Hide agenda"
        >
          ‹
        </button>
      </div>

      {/* Progress */}
      <div>
        <p className="text-xs font-semibold text-gp-fl3 uppercase tracking-widest mb-1">Progress</p>
        <p className="text-3xl font-bold text-gp-midnight">{inReview}/{tasks.length}</p>
        <p className="text-xs text-gp-fl2 mt-0.5">Tasks in review or done</p>
      </div>

      {/* Blocker summary */}
      <div>
        <p className="text-xs font-semibold text-gp-fl3 uppercase tracking-widest mb-1">Blocker Summary</p>
        <p className="text-3xl font-bold text-gp-midnight">{blocked.length}</p>
        <p className="text-xs text-gp-fl2 mt-0.5">Blocked tasks currently needing attention</p>
      </div>

      {/* Escalated blockers */}
      <div>
        <p className="text-xs font-semibold text-gp-fl3 uppercase tracking-widest mb-1">Escalated Blockers</p>
        <p className="text-3xl font-bold text-gp-midnight">{escalated}</p>
        <p className="text-xs text-gp-fl2 mt-0.5">Tasks blocked for 24+ hours</p>
      </div>

      {/* Team capacity */}
      <div>
        <p className="text-xs font-semibold text-gp-fl3 uppercase tracking-widest mb-2">Team Capacity</p>
        <div className="flex flex-col gap-2">
          {teamCapacity.map(({ team, totalUsed, totalMax, overloaded }) => {
            const pct    = totalMax > 0 ? Math.min((totalUsed / totalMax) * 100, 100) : 0;
            const status = overloaded > 0 ? 'red' : pct >= 75 ? 'amber' : 'green';
            const barCls = status === 'red' ? 'bg-red-400' : status === 'amber' ? 'bg-amber-400' : 'bg-green-400';
            const txtCls = status === 'red' ? 'text-red-600' : status === 'amber' ? 'text-amber-600' : 'text-green-600';
            return (
              <div key={team.id} className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gp-fl1 font-medium truncate">{team.name}</p>
                  <span className={`text-xs font-semibold ${txtCls}`}>{totalUsed}/{totalMax}</span>
                </div>
                <div className="h-1.5 bg-gp-cream rounded-none overflow-hidden">
                  <div className={`h-full rounded-none transition-all ${barCls}`} style={{ width: `${pct}%` }} />
                </div>
                {overloaded > 0 && (
                  <p className="text-xs text-red-500">{overloaded} worker{overloaded > 1 ? 's' : ''} over limit</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Blocked task watchlist */}
      <div>
        <p className="text-sm font-semibold text-gp-midnight mb-2">Blocked task watchlist</p>
        {blocked.length === 0 ? (
          <p className="text-xs text-gp-fl2">No blocked tasks.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {blocked.map(task => {
              const assigneeCount = (task.assignedUserIds ?? []).length;
              return (
                <div key={task.id} className="bg-gp-sunrise rounded-lg p-3 flex flex-col gap-0.5">
                  <p className="text-sm font-semibold text-gp-midnight leading-snug">{task.title}</p>
                  <p className="text-xs text-gp-fl2">{assigneeCount} assignee{assigneeCount !== 1 ? 's' : ''}</p>
                  <p className="text-xs text-gp-fl2">{formatDue(task.dueDate)}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
