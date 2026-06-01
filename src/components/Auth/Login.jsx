import { USERS, ROLES } from '../../data/mockData';

const ROLE_BADGE = {
  ADMIN:       { label: 'Admin',       className: 'border border-gp-coral text-gp-coral' },
  TEAM_LEAD:   { label: 'Team Lead',   className: 'border border-gp-fl1 text-gp-fl1' },
  TEAM_MEMBER: { label: 'Team Member', className: 'border border-gp-fl3 text-gp-fl2' },
};

const AVATAR_BG = {
  ADMIN:       'bg-gp-coral text-white',
  TEAM_LEAD:   'bg-gp-midnight text-white',
  TEAM_MEMBER: 'bg-gp-cream text-gp-midnight',
};

export default function Login({ onLogin }) {
  return (
    <div className="min-h-screen bg-gp-sunrise flex flex-col items-center justify-center px-6">

      {/* Hero header with Wayfinder */}
      <div className="mb-10 text-center gp-wayfinder px-10 py-6">
        <p className="text-xs font-semibold text-gp-coral tracking-widest mb-2">Genpact</p>
        <h1 className="text-3xl font-bold text-gp-midnight">Meeting Optimizer</h1>
        <p className="text-sm text-gp-fl2 mt-2 leading-comfortable">
          Workplace productivity hub — select your profile to continue
        </p>
      </div>

      {/* User card grid */}
      <div className="grid grid-cols-3 gap-4 w-full max-w-2xl">
        {USERS.map(user => {
          const badge  = ROLE_BADGE[user.role];
          const avatar = AVATAR_BG[user.role];
          return (
            <button
              key={user.id}
              onClick={() => onLogin(user)}
              className="bg-white rounded-xl border border-[rgba(22,25,22,0.12)] p-5 flex flex-col items-center gap-2.5 hover:shadow-lg hover:border-gp-coral transition-all duration-200 text-center group"
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-transform group-hover:scale-105 ${avatar}`}>
                {user.avatar}
              </div>
              <div>
                <p className="text-sm font-semibold text-gp-midnight leading-snug">{user.name}</p>
                <p className="text-xs text-gp-fl3 mt-0.5 leading-snug">{user.title}</p>
              </div>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${badge.className}`}>
                {badge.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <p className="text-xs text-gp-fl3 mt-10">
        Powered by <span className="font-semibold text-gp-fl2">Genpact</span>
      </p>
    </div>
  );
}
