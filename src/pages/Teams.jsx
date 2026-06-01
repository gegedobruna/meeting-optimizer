import { useState } from 'react';
import { USERS, TEAMS } from '../data/mockData';
import { canViewTeams } from '../utils/permissions';
import { getActiveTaskCount } from '../utils/users';

const heatClass = (n) => {
  if (n > 3) return 'bg-red-500 text-white';
  if (n >= 2) return 'bg-yellow-400 text-gray-900';
  return 'bg-green-400 text-white';
};

export default function Teams({ currentUser, tasks, onNavigate }) {
  const [expanded, setExpanded] = useState(null);

  if (!canViewTeams(currentUser)) {
    onNavigate('dashboard');
    return null;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto flex flex-col gap-6">
      <h2 className="text-lg font-semibold text-gray-800">Teams</h2>

      {TEAMS.map(team => {
        const lead    = USERS.find(u => u.id === team.leadId);
        const members = USERS.filter(u => team.memberIds.includes(u.id));

        return (
          <div key={team.id} className="bg-white rounded-xl shadow-sm p-5 flex flex-col gap-4">
            <div>
              <h3 className="font-semibold text-gray-800">{team.name}</h3>
              <p className="text-xs text-gray-400 mt-0.5">Lead: {lead?.name}</p>
            </div>

            {/* Workload heatmap */}
            <div>
              <p className="text-xs text-gray-500 font-medium mb-2">In Progress workload — click to expand</p>
              <div className="flex gap-2 flex-wrap">
                {members.map(member => {
                  const count = getActiveTaskCount(member.id, tasks);
                  return (
                    <button
                      key={member.id}
                      onClick={() => setExpanded(expanded === member.id ? null : member.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-opacity hover:opacity-80 ${heatClass(count)}`}
                    >
                      {member.name.split(' ')[0]} · {count}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-gray-300 mt-1">green &lt;2 · yellow 2–3 · red &gt;3</p>
            </div>

            {/* Expanded member task list */}
            {members.filter(m => m.id === expanded).map(member => {
              const memberTasks = tasks.filter(t => t.assignedUserIds?.includes(member.id));
              return (
                <div key={member.id} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-gray-700 mb-2">{member.name}'s tasks</p>
                  {memberTasks.length === 0 ? (
                    <p className="text-xs text-gray-400">No tasks assigned.</p>
                  ) : (
                    <div className="flex flex-col gap-1">
                      {memberTasks.map(t => (
                        <div key={t.id} className="flex items-center justify-between text-xs py-0.5">
                          <span className="text-gray-700 truncate max-w-xs">{t.title}</span>
                          <span className="text-gray-400 shrink-0 ml-3">{t.column}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Member chips */}
            <div>
              <p className="text-xs text-gray-500 font-medium mb-2">Members ({members.length})</p>
              <div className="flex flex-wrap gap-2">
                {members.map(member => (
                  <span key={member.id} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                    {member.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
