import { TEAMS } from '../../data/mockData';
import { getVisibleNavItems } from '../../utils/permissions';

const ROLE_BADGE = {
  ADMIN:       { label: 'Admin',       className: 'border border-red-400 text-red-500' },
  TEAM_LEAD:   { label: 'Team Lead',   className: 'border border-blue-400 text-blue-600' },
  TEAM_MEMBER: { label: 'Team Member', className: 'border border-blue-400 text-blue-600' },
};

export default function Sidebar({ currentUser, activePage, onNavigate, onLogout }) {
  const navItems = getVisibleNavItems(currentUser);
  const badge    = ROLE_BADGE[currentUser.role];
  const team     = TEAMS.find(t => t.memberIds.includes(currentUser.id));

  return (
    <aside className="fixed top-0 left-0 h-full w-56 bg-white border-r border-gray-100 text-gray-800 flex flex-col z-30">
      {/* App name */}
      <div className="px-5 py-4 border-b border-gray-100">
        <span className="text-sm font-bold text-gray-900 tracking-tight">Meeting Optimizer</span>
        <p className="text-xs text-gray-400 mt-0.5">Workplace productivity hub</p>
      </div>

      {/* User card */}
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold shrink-0">
            {currentUser.avatar}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{currentUser.name}</p>
            <p className="text-xs text-gray-400 truncate">{currentUser.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.className}`}>
            {badge.label}
          </span>
        </div>
        {team && (
          <p className="text-xs text-gray-400 mt-1">{team.name}</p>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 flex flex-col gap-0.5 overflow-y-auto">
        {navItems.map(item => (
          <button
            key={item.page}
            onClick={() => onNavigate(item.page)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2.5 ${
              activePage === item.page
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <span className="text-base leading-none">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-gray-100">
        <button
          onClick={onLogout}
          className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
