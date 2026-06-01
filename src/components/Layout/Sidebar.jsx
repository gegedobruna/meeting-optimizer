import { getVisibleNavItems } from '../../utils/permissions';

const ROLE_BADGE = {
  ADMIN:       { label: 'Admin',       className: 'bg-red-600 text-white' },
  TEAM_LEAD:   { label: 'Team Lead',   className: 'bg-blue-600 text-white' },
  TEAM_MEMBER: { label: 'Member',      className: 'bg-gray-600 text-white' },
};

export default function Sidebar({ currentUser, activePage, onNavigate, onLogout }) {
  const navItems = getVisibleNavItems(currentUser);
  const badge    = ROLE_BADGE[currentUser.role];

  return (
    <aside className="fixed top-0 left-0 h-full w-56 bg-gray-900 text-white flex flex-col z-30">
      {/* App name */}
      <div className="px-5 py-4 border-b border-gray-700">
        <span className="text-base font-bold tracking-tight">Meeting Optimizer</span>
      </div>

      {/* User card */}
      <div className="px-5 py-4 border-b border-gray-700 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gray-600 flex items-center justify-center text-xs font-bold shrink-0">
          {currentUser.avatar}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{currentUser.name}</p>
          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${badge.className}`}>
            {badge.label}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 flex flex-col gap-1 overflow-y-auto">
        {navItems.map(item => (
          <button
            key={item.page}
            onClick={() => onNavigate(item.page)}
            className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
              activePage === item.page
                ? 'bg-blue-600 text-white font-medium'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-gray-700">
        <button
          onClick={onLogout}
          className="w-full text-left px-3 py-2 rounded text-sm text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
