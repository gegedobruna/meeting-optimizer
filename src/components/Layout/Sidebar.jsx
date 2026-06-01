import { TEAMS } from '../../data/mockData';
import { getVisibleNavItems } from '../../utils/permissions';

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

export default function Sidebar({ currentUser, activePage, onNavigate, onLogout }) {
  const navItems = getVisibleNavItems(currentUser);
  const badge    = ROLE_BADGE[currentUser.role];
  const avatarBg = AVATAR_BG[currentUser.role];
  const team     = TEAMS.find(t => t.memberIds.includes(currentUser.id));

  return (
    <aside className="fixed top-0 left-0 h-full w-56 bg-white border-r border-[rgba(22,25,22,0.08)] flex flex-col z-30">

      {/* Brand lockup */}
      <div className="px-5 py-4 border-b border-[rgba(22,25,22,0.08)]">
        <div className="flex items-center gap-1.5 mb-0.5">
          {/* Genpact coral accent mark */}
          <span className="w-2 h-2 rounded-none bg-gp-coral shrink-0" />
          <span className="text-sm font-bold text-gp-midnight tracking-tight">Meeting Optimizer</span>
        </div>
        <p className="text-xs text-gp-fl3 leading-comfortable pl-3.5">Workplace productivity hub</p>
      </div>

      {/* User card */}
      <div className="px-5 py-4 border-b border-[rgba(22,25,22,0.08)]">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${avatarBg}`}>
            {currentUser.avatar}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gp-midnight truncate leading-snug">{currentUser.name}</p>
            <p className="text-xs text-gp-fl3 truncate leading-snug">{currentUser.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2.5 pl-0">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.className}`}>
            {badge.label}
          </span>
        </div>
        {team && (
          <p className="text-xs text-gp-fl3 mt-1.5 leading-snug">{team.name}</p>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 flex flex-col gap-0.5 overflow-y-auto">
        {navItems.map(item => (
          <button
            key={item.page}
            onClick={() => onNavigate(item.page)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2.5 font-medium ${
              activePage === item.page
                ? 'bg-gp-cream text-gp-coral font-semibold'
                : 'text-gp-fl2 hover:bg-gp-sunrise hover:text-gp-midnight'
            }`}
          >
            <span className="text-base leading-none">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-[rgba(22,25,22,0.08)]">
        <button
          onClick={onLogout}
          className="w-full text-left px-3 py-2 rounded-lg text-sm text-gp-fl3 hover:bg-gp-sunrise hover:text-gp-midnight transition-colors font-medium"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
