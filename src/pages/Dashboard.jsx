import { USERS, TEAMS } from '../data/mockData';
import { canViewTeams, canViewAnalytics } from '../utils/permissions';
import { getActiveTaskCount } from '../utils/users';

const METRIC_COLS = ["To Do", "In Progress", "Blocked", "Done"];

const blockerHours = (task) =>
  task.blockedSince ? (Date.now() - new Date(task.blockedSince).getTime()) / 3_600_000 : 0;

export default function Dashboard({ currentUser, tasks, meetingRequests }) {
  const myTasks      = tasks.filter(t => t.assignedUserIds?.includes(currentUser.id));
  const blockedAll   = tasks.filter(t => t.column === "Blocked" && t.blockedSince);
  const approved     = meetingRequests.filter(r => r.status === 'APPROVED');
  const pending      = meetingRequests.filter(r => r.status === 'PENDING');

  const escalation = {
    h24: blockedAll.filter(t => { const h = blockerHours(t); return h >= 24 && h < 48; }).length,
    h48: blockedAll.filter(t => { const h = blockerHours(t); return h >= 48 && h < 72; }).length,
    h72: blockedAll.filter(t => blockerHours(t) >= 72).length,
  };

  const myTeam      = TEAMS.find(t => t.memberIds.includes(currentUser.id));
  const teamMembers = myTeam ? USERS.filter(u => myTeam.memberIds.includes(u.id)) : [];

  return (
    <div className="p-6 max-w-5xl mx-auto flex flex-col gap-6">
      <h2 className="text-lg font-semibold text-gray-800">Dashboard</h2>

      {/* Personal task counts */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">My Tasks</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {METRIC_COLS.map(col => (
            <div key={col} className="bg-white rounded-xl shadow-sm p-4">
              <p className="text-2xl font-bold text-gray-900">
                {myTasks.filter(t => t.column === col).length}
              </p>
              <p className="text-xs text-gray-500 mt-1">{col}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Approved meetings */}
      <div className="bg-white rounded-xl shadow-sm p-4 flex gap-6">
        <div>
          <p className="text-2xl font-bold text-gray-900">{approved.length}</p>
          <p className="text-xs text-gray-500 mt-1">Approved Meetings</p>
        </div>
      </div>

      {/* Team workload — TEAM_LEAD + ADMIN */}
      {canViewTeams(currentUser) && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Team Workload</p>
          <div className="bg-white rounded-xl shadow-sm p-5 flex flex-col gap-3">
            {teamMembers.map(member => {
              const active = getActiveTaskCount(member.id, tasks);
              return (
                <div key={member.id} className="flex items-center gap-3 text-sm">
                  <span className="w-36 text-gray-700 truncate">{member.name}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min((active / 5) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-16 text-right">{active} active</span>
                </div>
              );
            })}

            <div className="mt-2 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500 font-medium mb-2">Blocked Escalation</p>
              <div className="flex gap-5 text-xs">
                <span className="text-yellow-600">24h+: <b>{escalation.h24}</b></span>
                <span className="text-orange-600">48h+: <b>{escalation.h48}</b></span>
                <span className="text-red-600">72h+: <b>{escalation.h72}</b></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin-only summary */}
      {canViewAnalytics(currentUser) && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Overview</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <p className="text-2xl font-bold text-gray-900">{pending.length}</p>
              <p className="text-xs text-gray-500 mt-1">Pending Requests</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4">
              <p className="text-2xl font-bold text-gray-900">{TEAMS.length}</p>
              <p className="text-xs text-gray-500 mt-1">Teams</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4">
              <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
              <p className="text-xs text-gray-500 mt-1">Total Tasks</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
