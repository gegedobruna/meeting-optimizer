import { USERS, TEAMS, ROLES } from '../data/mockData';
import { getActiveTaskCount, getUserById } from '../utils/users';

const blockerHours = (task) =>
  task.blockedSince ? (Date.now() - new Date(task.blockedSince).getTime()) / 3_600_000 : 0;

const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }) : null;

const StatTile = ({ value, label }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-50 p-5">
    <p className="text-3xl font-bold text-gray-900">{value}</p>
    <p className="text-xs text-gray-400 mt-1">{label}</p>
  </div>
);

const SectionLabel = ({ children }) => (
  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">{children}</p>
);

// ─── TEAM_MEMBER ────────────────────────────────────────────────────────────

function MemberDashboard({ currentUser, tasks, meetingRequests }) {
  const myTasks    = tasks.filter(t => t.assignedUserIds?.includes(currentUser.id));
  const active     = getActiveTaskCount(currentUser.id, tasks);
  const completed  = myTasks.filter(t => t.column === 'Done').length;
  const notifs     = meetingRequests.filter(r => r.status === 'PENDING').length;
  const drafts     = myTasks.filter(t => t.fromMeeting).length;
  const approved   = meetingRequests.filter(r => r.status === 'APPROVED');
  const dueSoon    = myTasks
    .filter(t => t.dueDate)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);

  const wipStatus = active <= 2
    ? { text: 'Healthy workload',          cls: 'bg-green-50 text-green-700' }
    : active <= 4
    ? { text: 'Moderate load',             cls: 'bg-orange-50 text-orange-600' }
    : { text: 'High load — consider reassigning', cls: 'bg-red-50 text-red-600' };

  return (
    <div className="flex flex-col gap-6">
      {/* Stat tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatTile value={active}    label="My active tasks" />
        <StatTile value={completed} label="Completed tasks" />
        <StatTile value={notifs}    label="Notifications" />
        <StatTile value={drafts}    label="Draft action items" />
      </div>

      {/* Three cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* WIP Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-50 p-5 flex flex-col gap-3">
          <p className="text-sm font-semibold text-gray-700">Current WIP status</p>
          <div className={`px-4 py-3 rounded-lg font-semibold text-sm ${wipStatus.cls}`}>
            {wipStatus.text}
          </div>
        </div>

        {/* Upcoming meetings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-50 p-5 flex flex-col gap-3">
          <p className="text-sm font-semibold text-gray-700">Upcoming meetings</p>
          {approved.length === 0 ? (
            <p className="text-xs text-gray-400">No upcoming meetings.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {approved.map(r => (
                <div key={r.id} className="border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                  <p className="text-sm font-medium text-gray-800">{r.title}</p>
                  <p className="text-xs text-gray-400">
                    {r.scheduledDate ? formatDate(r.scheduledDate) + ' · 09:00' : 'No date set'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tasks due soon */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-50 p-5 flex flex-col gap-3">
          <p className="text-sm font-semibold text-gray-700">Tasks due soon</p>
          {dueSoon.length === 0 ? (
            <p className="text-xs text-gray-400">No upcoming deadlines.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {dueSoon.map(t => (
                <div key={t.id} className="border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                  <p className="text-sm font-medium text-gray-800">{t.title}</p>
                  <p className="text-xs text-gray-400">Due {formatDate(t.dueDate)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── TEAM_LEAD ───────────────────────────────────────────────────────────────

function LeadDashboard({ currentUser, tasks, meetingRequests }) {
  const myTeam      = TEAMS.find(t => t.memberIds.includes(currentUser.id));
  const teamMembers = myTeam ? USERS.filter(u => myTeam.memberIds.includes(u.id)) : [];
  const totalActive = teamMembers.reduce((sum, m) => sum + getActiveTaskCount(m.id, tasks), 0);
  const pending     = meetingRequests.filter(r => r.status === 'PENDING');
  const blockedAll  = tasks.filter(t => t.column === 'Blocked' && t.blockedSince);

  const escalation = {
    h24: blockedAll.filter(t => { const h = blockerHours(t); return h >= 24 && h < 48; }).length,
    h48: blockedAll.filter(t => { const h = blockerHours(t); return h >= 48 && h < 72; }).length,
    h72: blockedAll.filter(t => blockerHours(t) >= 72).length,
  };

  const barColor = (n) =>
    n <= 2 ? 'bg-green-400' : n <= 4 ? 'bg-amber-400' : 'bg-red-500';

  return (
    <div className="flex flex-col gap-6">
      {/* Stat tiles */}
      <div className="grid grid-cols-3 gap-4">
        <StatTile value={teamMembers.length} label="Team members" />
        <StatTile value={totalActive}        label="Active across team" />
        <StatTile value={pending.length}     label="Pending requests" />
      </div>

      {/* Team workload grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-50 p-5 flex flex-col gap-4">
        <SectionLabel>Team workload — {myTeam?.name}</SectionLabel>
        {teamMembers.map(member => {
          const active = getActiveTaskCount(member.id, tasks);
          return (
            <div key={member.id} className="flex items-center gap-3 text-sm">
              <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0">
                {member.avatar}
              </div>
              <div className="w-32 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{member.name}</p>
                <p className="text-xs text-gray-400 truncate">{member.title}</p>
              </div>
              <div className="flex-1 bg-gray-100 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${barColor(active)}`}
                  style={{ width: `${Math.min((active / 5) * 100, 100)}%` }}
                />
              </div>
              <span className="text-xs text-gray-400 w-16 text-right shrink-0">{active} active</span>
            </div>
          );
        })}
        <div className="pt-3 border-t border-gray-100 flex gap-5 text-xs">
          <span className="text-yellow-600">24h+: <b>{escalation.h24}</b></span>
          <span className="text-orange-600">48h+: <b>{escalation.h48}</b></span>
          <span className="text-red-600">72h+: <b>{escalation.h72}</b></span>
        </div>
      </div>

      {/* Pending requests */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-50 p-5 flex flex-col gap-3">
        <SectionLabel>Pending meeting requests</SectionLabel>
        {pending.length === 0 ? (
          <p className="text-xs text-gray-400">No pending requests.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {pending.map(r => {
              const requester = getUserById(r.requestedBy);
              return (
                <div key={r.id} className="flex items-start justify-between gap-3 py-2 border-b border-gray-50 last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800">{r.title}</p>
                    {requester && <p className="text-xs text-gray-400 mt-0.5">{requester.name}</p>}
                    {r.reason && <p className="text-xs text-gray-400 italic mt-0.5 truncate">{r.reason}</p>}
                  </div>
                  <span className="text-xs bg-yellow-50 text-yellow-600 px-2 py-0.5 rounded-full font-medium shrink-0">
                    Pending
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ADMIN ───────────────────────────────────────────────────────────────────

function AdminDashboard({ tasks, meetingRequests }) {
  const pending   = meetingRequests.filter(r => r.status === 'PENDING');
  const done      = tasks.filter(t => t.column === 'Done');

  const barColor = (n) =>
    n <= 2 ? 'bg-green-400' : n <= 4 ? 'bg-amber-400' : 'bg-red-500';

  // Cross-department distribution
  const DEPARTMENTS = ['Engineering', 'Design', 'QA'];
  const deptCounts = DEPARTMENTS.map(dept => ({
    dept,
    count: tasks.filter(t => {
      const user = getUserById(t.assignedUserIds?.[0]);
      return user?.department === dept;
    }).length,
  }));
  const unassigned = tasks.filter(t => !t.assignedUserIds?.length).length;
  const maxDept = Math.max(...deptCounts.map(d => d.count), unassigned, 1);

  return (
    <div className="flex flex-col gap-6">
      {/* Global stat tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatTile value={tasks.length}   label="Total tasks" />
        <StatTile value={TEAMS.length}   label="Active teams" />
        <StatTile value={pending.length} label="Pending requests" />
        <StatTile value={done.length}    label="Completed tasks" />
      </div>

      {/* Multi-team heatmap */}
      <div>
        <SectionLabel>Team workload heatmap</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {TEAMS.map(team => {
            const lead    = getUserById(team.leadId);
            const members = USERS.filter(u => team.memberIds.includes(u.id));
            return (
              <div key={team.id} className="bg-white rounded-xl shadow-sm border border-gray-50 p-5 flex flex-col gap-3">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{team.name}</p>
                  {lead && <p className="text-xs text-gray-400">Lead: {lead.name}</p>}
                </div>
                {members.map(member => {
                  const active = getActiveTaskCount(member.id, tasks);
                  return (
                    <div key={member.id} className="flex items-center gap-3 text-sm">
                      <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0">
                        {member.avatar}
                      </span>
                      <span className="w-28 text-xs text-gray-700 truncate">{member.name}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${barColor(active)}`}
                          style={{ width: `${Math.min((active / 5) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 w-12 text-right shrink-0">{active}</span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Cross-department distribution */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-50 p-5 flex flex-col gap-3">
        <SectionLabel>Cross-department task distribution</SectionLabel>
        {deptCounts.map(({ dept, count }) => (
          <div key={dept} className="flex items-center gap-3 text-sm">
            <span className="w-28 text-xs text-gray-700">{dept}</span>
            <div className="flex-1 bg-gray-100 rounded-full h-2">
              <div
                className="bg-indigo-400 h-2 rounded-full transition-all"
                style={{ width: `${(count / maxDept) * 100}%` }}
              />
            </div>
            <span className="text-xs text-gray-400 w-6 text-right">{count}</span>
          </div>
        ))}
        {unassigned > 0 && (
          <div className="flex items-center gap-3 text-sm">
            <span className="w-28 text-xs text-gray-400 italic">Unassigned</span>
            <div className="flex-1 bg-gray-100 rounded-full h-2">
              <div
                className="bg-gray-300 h-2 rounded-full transition-all"
                style={{ width: `${(unassigned / maxDept) * 100}%` }}
              />
            </div>
            <span className="text-xs text-gray-400 w-6 text-right">{unassigned}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Root ────────────────────────────────────────────────────────────────────

export default function Dashboard({ currentUser, tasks, meetingRequests }) {
  const renderPath = () => {
    switch (currentUser.role) {
      case ROLES.TEAM_MEMBER:
        return <MemberDashboard currentUser={currentUser} tasks={tasks} meetingRequests={meetingRequests} />;
      case ROLES.TEAM_LEAD:
        return <LeadDashboard currentUser={currentUser} tasks={tasks} meetingRequests={meetingRequests} />;
      case ROLES.ADMIN:
        return <AdminDashboard tasks={tasks} meetingRequests={meetingRequests} />;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto flex flex-col gap-6">
      {/* Common header */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Welcome back</p>
        <h1 className="text-3xl font-bold text-gray-900 mt-1">{currentUser.name}</h1>
        <p className="text-sm text-gray-500 mt-1">Your personalized meeting and task overview.</p>
      </div>

      {renderPath()}
    </div>
  );
}
