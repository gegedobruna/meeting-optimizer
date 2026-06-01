import { USERS } from '../data/mockData';
import { canViewAnalytics } from '../utils/permissions';

const blockerHours = (task) =>
  (Date.now() - new Date(task.blockedSince).getTime()) / 3_600_000;

export default function Analytics({ currentUser, tasks, meetingRequests, onNavigate }) {
  if (!canViewAnalytics(currentUser)) {
    onNavigate('dashboard');
    return null;
  }

  // Throughput
  const doneTasks  = tasks.filter(t => t.column === "Done");
  const throughput = USERS
    .map(u => ({ name: u.name, count: doneTasks.filter(t => t.assignee === u.name).length }))
    .filter(u => u.count > 0)
    .sort((a, b) => b.count - a.count);
  const maxDone = Math.max(...throughput.map(u => u.count), 1);

  // Blocker breakdown
  const blocked = tasks.filter(t => t.column === "Blocked" && t.blockedSince);
  const b24 = blocked.filter(t => { const h = blockerHours(t); return h >= 24 && h < 48; }).length;
  const b48 = blocked.filter(t => { const h = blockerHours(t); return h >= 48 && h < 72; }).length;
  const b72 = blocked.filter(t => blockerHours(t) >= 72).length;

  // Meeting ROI
  const total    = meetingRequests.length;
  const approved = meetingRequests.filter(r => r.status === 'APPROVED');
  const rate     = total > 0 ? Math.round((approved.length / total) * 100) : 0;

  return (
    <div className="p-6 max-w-4xl mx-auto flex flex-col gap-6">
      <h2 className="text-lg font-semibold text-gray-800">Analytics</h2>

      {/* Throughput */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Throughput — Completed Tasks</h3>
        {throughput.length === 0 ? (
          <p className="text-xs text-gray-400">No completed tasks yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {throughput.map(({ name, count }) => (
              <div key={name} className="flex items-center gap-3 text-sm">
                <span className="w-36 text-gray-700 truncate">{name}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-3">
                  <div
                    className="bg-indigo-500 h-3 rounded-full transition-all"
                    style={{ width: `${(count / maxDone) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-6 text-right">{count}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Meeting ROI */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Meeting ROI</h3>
        <div className="flex gap-8 mb-4">
          <div><p className="text-2xl font-bold text-gray-900">{rate}%</p><p className="text-xs text-gray-400">Approval rate</p></div>
          <div><p className="text-2xl font-bold text-gray-900">{approved.length}</p><p className="text-xs text-gray-400">Approved</p></div>
          <div><p className="text-2xl font-bold text-gray-900">{total}</p><p className="text-xs text-gray-400">Total requests</p></div>
        </div>
        {approved.length > 0 && (
          <div className="flex flex-col gap-0.5">
            {approved.map(r => (
              <div key={r.id} className="flex justify-between text-xs text-gray-600 py-1 border-b border-gray-50 last:border-0">
                <span className="truncate max-w-xs">{r.title}</span>
                <span className="text-gray-400 shrink-0 ml-3">{r.params?.participantCount ?? '—'} participants</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Blocker breakdown */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Blocker Escalation</h3>
        <div className="flex gap-8">
          <div><p className="text-2xl font-bold text-yellow-600">{b24}</p><p className="text-xs text-gray-400">24h+</p></div>
          <div><p className="text-2xl font-bold text-orange-600">{b48}</p><p className="text-xs text-gray-400">48h+</p></div>
          <div><p className="text-2xl font-bold text-red-600">{b72}</p><p className="text-xs text-gray-400">72h+</p></div>
          <div><p className="text-2xl font-bold text-gray-400">{blocked.length}</p><p className="text-xs text-gray-400">Total blocked</p></div>
        </div>
      </div>
    </div>
  );
}
