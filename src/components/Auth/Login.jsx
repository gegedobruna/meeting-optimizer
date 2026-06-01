import { USERS, ROLES } from '../../data/mockData';

const ROLE_BADGE = {
  ADMIN:       { label: 'Admin',       className: 'border border-red-400 text-red-500' },
  TEAM_LEAD:   { label: 'Team Lead',   className: 'border border-blue-400 text-blue-600' },
  TEAM_MEMBER: { label: 'Team Member', className: 'border border-slate-300 text-slate-500' },
};

const AVATAR_COLOR = {
  ADMIN:       'bg-red-100 text-red-700',
  TEAM_LEAD:   'bg-blue-100 text-blue-700',
  TEAM_MEMBER: 'bg-slate-100 text-slate-700',
};

export default function Login({ onLogin }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Meeting Optimizer</h1>
        <p className="text-sm text-gray-400 mt-1">Workplace productivity hub</p>
        <p className="text-sm text-gray-500 mt-4">Select your profile to continue</p>
      </div>

      {/* User card grid */}
      <div className="grid grid-cols-3 gap-4 w-full max-w-2xl">
        {USERS.map(user => {
          const badge  = ROLE_BADGE[user.role];
          const avatar = AVATAR_COLOR[user.role];
          return (
            <button
              key={user.id}
              onClick={() => onLogin(user)}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col items-center gap-2 hover:shadow-md hover:ring-2 hover:ring-blue-400 transition-all text-center"
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-base font-bold ${avatar}`}>
                {user.avatar}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{user.title}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 ${badge.className}`}>
                {badge.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
