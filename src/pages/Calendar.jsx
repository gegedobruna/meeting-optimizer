import { useState, useMemo } from 'react';
import { ROLES, TEAMS } from '../data/mockData';

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_NAMES   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const toPrefix = (date) =>
  `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;

const formatDateTime = (iso) => {
  if (!iso) return null;
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { year:'numeric', month:'2-digit', day:'2-digit' })
    + ' · ' + d.toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit', hour12:false });
};

const formatDue = (iso) => {
  if (!iso) return null;
  return 'Due ' + new Date(iso).toLocaleDateString('en-US', { year:'numeric', month:'2-digit', day:'2-digit' });
};

const STATUS_PILL = {
  APPROVED: 'text-green-600 font-semibold',
  PENDING:  'text-amber-500 font-semibold',
  REJECTED: 'text-slate-400',
};

// ─── Personal Schedule View ──────────────────────────────────────────────────

function ScheduleView({ currentUser, tasks, meetingRequests }) {
  const today     = new Date();
  const todayPfx  = toPrefix(today);

  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const weekEnd   = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const approved   = meetingRequests.filter(r => r.status === 'APPROVED');

  const isThisWeek = (iso) => {
    if (!iso) return false;
    const d = new Date(iso);
    return d >= weekStart && d <= weekEnd;
  };

  // Stat tiles
  const todayMeetings  = approved.filter(r => r.scheduledDate?.startsWith(todayPfx));
  const weekMeetings   = approved.filter(r => isThisWeek(r.scheduledDate));
  const todayMins      = todayMeetings.reduce((s, r) => s + (r.params?.durationMins ?? 0), 0);
  const weekMins       = weekMeetings.reduce((s, r) => s + (r.params?.durationMins ?? 0), 0);

  // Today / This week / Upcoming panels — tasks + meetings
  const todayTasks     = tasks.filter(t => t.dueDate?.startsWith(todayPfx));
  const weekTasks      = tasks.filter(t => t.dueDate && isThisWeek(new Date(t.dueDate)));
  const upcomingTasks  = tasks
    .filter(t => t.dueDate && new Date(t.dueDate) > weekEnd)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  // Task deadlines (all with due date, sorted)
  const deadlines = tasks
    .filter(t => t.dueDate)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  // Meeting history (all requests, newest first)
  const history = [...meetingRequests]
    .sort((a, b) => new Date(b.scheduledDate ?? 0) - new Date(a.scheduledDate ?? 0));

  const PanelEntry = ({ title, sub, pill }) => (
    <div className="py-2 border-b border-[rgba(22,25,22,0.06)] last:border-0">
      <p className="text-sm font-medium text-gp-midnight">{title}</p>
      {sub  && <p className="text-xs text-gp-fl3 mt-0.5">{sub}</p>}
      {pill && <p className={`text-xs mt-0.5 uppercase tracking-wide ${STATUS_PILL[pill] ?? 'text-slate-400'}`}>{pill}</p>}
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Stat tiles */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Today's meeting time", value: todayMins > 0 ? `${todayMins} min` : '0 min' },
          { label: 'This week',            value: weekMins  > 0 ? `${weekMins} min`  : '0 min' },
          { label: 'Approved meetings',    value: approved.length },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-[rgba(22,25,22,0.12)] p-5">
            <p className="text-xs text-gp-fl3 font-medium mb-1">{label}</p>
            <p className="text-2xl font-bold text-gp-midnight">{value}</p>
          </div>
        ))}
      </div>

      {/* Today / This Week / Upcoming */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Today',     items: todayTasks,    empty: 'No entries.' },
          { label: 'This Week', items: weekTasks,     empty: 'No entries.' },
          { label: 'Upcoming',  items: upcomingTasks, empty: 'No entries.' },
        ].map(({ label, items, empty }) => (
          <div key={label} className="bg-white rounded-xl border border-[rgba(22,25,22,0.12)] p-5">
            <p className="text-sm font-semibold text-gp-fl1 mb-3">{label}</p>
            {items.length === 0 ? (
              <p className="text-xs text-gp-fl2">{empty}</p>
            ) : (
              items.map(t => (
                <PanelEntry key={t.id} title={t.title} sub={formatDue(t.dueDate)} />
              ))
            )}
          </div>
        ))}
      </div>

      {/* Task deadlines + Meeting history */}
      <div className="grid grid-cols-2 gap-4">
        {/* Task deadlines */}
        <div className="bg-white rounded-xl border border-[rgba(22,25,22,0.12)] p-5">
          <p className="text-sm font-semibold text-gp-fl1 mb-3">Task deadlines</p>
          {deadlines.length === 0 ? (
            <p className="text-xs text-gp-fl2">No upcoming deadlines.</p>
          ) : (
            deadlines.map(t => (
              <PanelEntry key={t.id} title={t.title} sub={formatDue(t.dueDate)} />
            ))
          )}
        </div>

        {/* Meeting history */}
        <div className="bg-white rounded-xl border border-[rgba(22,25,22,0.12)] p-5 overflow-y-auto max-h-80">
          <p className="text-sm font-semibold text-gp-fl1 mb-3">Meeting history</p>
          {history.length === 0 ? (
            <p className="text-xs text-gp-fl2">No meeting requests yet.</p>
          ) : (
            history.map(r => (
              <PanelEntry
                key={r.id}
                title={r.title}
                sub={r.scheduledDate ? formatDateTime(r.scheduledDate) : null}
                pill={r.status}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Calendar Grid View ──────────────────────────────────────────────────────

function GridView({ currentUser, tasks, meetingRequests }) {
  const today = new Date();
  const [year,     setYear]     = useState(today.getFullYear());
  const [month,    setMonth]    = useState(today.getMonth());
  const [selected, setSelected] = useState(null);

  const approved = meetingRequests.filter(r => r.status === 'APPROVED');

  const toDatePrefix = (y, m, d) =>
    `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;

  const firstDOW    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => month === 0  ? (setYear(y => y-1), setMonth(11)) : setMonth(m => m-1);
  const nextMonth = () => month === 11 ? (setYear(y => y+1), setMonth(0))  : setMonth(m => m+1);

  const tasksOnDay    = (d) => tasks.filter(t => t.dueDate?.startsWith(toDatePrefix(year, month, d)));
  const meetingsOnDay = (d) => approved.filter(r => r.scheduledDate?.startsWith(toDatePrefix(year, month, d)));

  const selTasks    = selected ? tasksOnDay(selected)    : [];
  const selMeetings = selected ? meetingsOnDay(selected) : [];

  const cells = [...Array(firstDOW).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i+1)];

  return (
    <div className="flex flex-col gap-4">
      {/* Nav */}
      <div className="flex items-center gap-3">
        <button onClick={prevMonth} className="text-gp-fl3 hover:text-gp-midnight px-2 py-1 rounded hover:bg-gp-cream text-lg transition-colors">‹</button>
        <h3 className="text-base font-semibold text-gp-midnight w-44">{MONTH_NAMES[month]} {year}</h3>
        <button onClick={nextMonth} className="text-gp-fl3 hover:text-gp-midnight px-2 py-1 rounded hover:bg-gp-cream text-lg transition-colors">›</button>
      </div>

      <div className="flex gap-4 items-start">
        {/* Grid */}
        <div className="flex-1">
          <div className="grid grid-cols-7 mb-1">
            {DAY_NAMES.map(d => (
              <div key={d} className="text-center text-xs text-gp-fl3 font-medium py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              if (!day) return <div key={`e-${i}`} />;
              const isToday    = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
              const isSelected = selected === day;
              const hasTasks   = tasksOnDay(day).length > 0;
              const hasMeet    = meetingsOnDay(day).length > 0;
              return (
                <div
                  key={day}
                  onClick={() => setSelected(isSelected ? null : day)}
                  className={`min-h-[52px] rounded-lg p-1.5 cursor-pointer border transition-colors ${
                    isSelected ? 'border-blue-400 bg-blue-50' :
                    isToday    ? 'border-blue-200 bg-blue-50/60' :
                                 'border-[rgba(22,25,22,0.10)] bg-white hover:border-gp-fl3'
                  }`}
                >
                  <p className={`text-xs font-medium ${isToday ? 'text-blue-600' : 'text-gp-fl1'}`}>{day}</p>
                  <div className="flex gap-0.5 mt-1 flex-wrap">
                    {hasTasks && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
                    {hasMeet  && <span className="w-1.5 h-1.5 rounded-full bg-green-400" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Side panel */}
        {selected && (
          <div className="w-64 bg-white rounded-xl border border-[rgba(22,25,22,0.12)] p-4 flex flex-col gap-3">
            <p className="text-sm font-semibold text-gp-fl1">{MONTH_NAMES[month]} {selected}</p>
            {selTasks.length === 0 && selMeetings.length === 0 && (
              <p className="text-xs text-gp-fl2">Nothing scheduled.</p>
            )}
            {selTasks.length > 0 && (
              <div>
                <p className="text-xs text-gp-fl2 font-semibold uppercase tracking-wide mb-1">Tasks due</p>
                {selTasks.map(t => (
                  <div key={t.id} className="text-xs text-gp-midnight py-1.5 border-b border-[rgba(22,25,22,0.06)] last:border-0 truncate">{t.title}</div>
                ))}
              </div>
            )}
            {selMeetings.length > 0 && (
              <div>
                <p className="text-xs text-gp-fl2 font-semibold uppercase tracking-wide mb-1">Meetings</p>
                {selMeetings.map(r => (
                  <div key={r.id} className="text-xs text-gp-midnight py-1.5 border-b border-[rgba(22,25,22,0.06)] last:border-0 truncate">{r.title}</div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex gap-5 text-xs text-gp-fl3">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-400 inline-block" /> Tasks due</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-400 inline-block" /> Approved meetings</span>
      </div>
    </div>
  );
}

// ─── Root ────────────────────────────────────────────────────────────────────

export default function Calendar({ currentUser, tasks, meetingRequests }) {
  const [view, setView] = useState('schedule');

  const isAdmin = currentUser.role === ROLES.ADMIN;
  const isLead  = currentUser.role === ROLES.TEAM_LEAD;
  const myTeam  = TEAMS.find(t => t.id === currentUser.teamId) ?? null;

  // Scope tasks by role — meetings are always global (all approved)
  const scopedTasks = useMemo(() => {
    if (isAdmin) return tasks;
    if (isLead && myTeam) return tasks.filter(t =>
      (t.assignedUserIds ?? []).some(uid => myTeam.memberIds.includes(uid))
    );
    return tasks.filter(t => (t.assignedUserIds ?? []).includes(currentUser.id));
  }, [tasks, isAdmin, isLead, myTeam, currentUser.id]);

  const scheduleTitle = isAdmin ? 'Organization schedule' : isLead ? 'Team schedule' : 'Personal schedule';
  const scheduleSubtitle = isAdmin
    ? 'All approved meetings and deadlines across the organization.'
    : isLead
    ? 'Your team\'s approved meetings and upcoming deadlines.'
    : 'See your approved meetings and upcoming deadlines in one place.';

  return (
    <div className="p-6 max-w-5xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="gp-wayfinder">
          <p className="text-xs font-semibold text-gp-fl3 uppercase tracking-widest mb-1">Calendar</p>
          <h1 className="text-3xl font-bold text-gp-midnight">
            {view === 'schedule' ? scheduleTitle : 'Calendar view'}
          </h1>
          <p className="text-sm text-gp-fl2 mt-1">
            {view === 'schedule' ? scheduleSubtitle : 'Browse tasks and meetings by date.'}
          </p>
        </div>

        {/* Toggle */}
        <div className="flex items-center bg-gp-cream rounded-lg p-1 gap-1 shrink-0 mt-1">
          <button
            onClick={() => setView('schedule')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              view === 'schedule'
                ? 'bg-white text-gp-midnight shadow-sm'
                : 'text-gp-fl2 hover:text-gp-midnight'
            }`}
          >
            Schedule
          </button>
          <button
            onClick={() => setView('calendar')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              view === 'calendar'
                ? 'bg-white text-gp-midnight shadow-sm'
                : 'text-gp-fl2 hover:text-gp-midnight'
            }`}
          >
            Calendar
          </button>
        </div>
      </div>

      {view === 'schedule'
        ? <ScheduleView currentUser={currentUser} tasks={scopedTasks} meetingRequests={meetingRequests} />
        : <GridView     currentUser={currentUser} tasks={scopedTasks} meetingRequests={meetingRequests} />
      }
    </div>
  );
}
