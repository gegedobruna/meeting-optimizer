import { useState } from 'react';

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_NAMES   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const toDatePrefix = (year, month, day) =>
  `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;

export default function Calendar({ tasks, meetingRequests }) {
  const today = new Date();
  const [year,     setYear]     = useState(today.getFullYear());
  const [month,    setMonth]    = useState(today.getMonth());
  const [selected, setSelected] = useState(null);

  const firstDOW    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
    setSelected(null);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
    setSelected(null);
  };

  const tasksOnDay    = (d) => tasks.filter(t => t.dueDate?.startsWith(toDatePrefix(year, month, d)));
  const meetingsOnDay = (d) => meetingRequests.filter(r => r.status === 'APPROVED' && r.scheduledDate?.startsWith(toDatePrefix(year, month, d)));

  const selTasks    = selected ? tasksOnDay(selected)    : [];
  const selMeetings = selected ? meetingsOnDay(selected) : [];

  // Build grid cells: nulls for leading empty days, then 1..daysInMonth
  const cells = [
    ...Array(firstDOW).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto flex flex-col gap-5">
      {/* Nav */}
      <div className="flex items-center gap-3">
        <button onClick={prevMonth} className="text-gray-500 hover:text-gray-800 px-2 py-1 rounded hover:bg-gray-100 text-lg">‹</button>
        <h2 className="text-lg font-semibold text-gray-800 w-48">{MONTH_NAMES[month]} {year}</h2>
        <button onClick={nextMonth} className="text-gray-500 hover:text-gray-800 px-2 py-1 rounded hover:bg-gray-100 text-lg">›</button>
      </div>

      <div className="flex gap-4 items-start">
        {/* Calendar grid */}
        <div className="flex-1">
          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {DAY_NAMES.map(d => (
              <div key={d} className="text-center text-xs text-gray-400 font-medium py-1">{d}</div>
            ))}
          </div>
          {/* Cells */}
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              if (!day) return <div key={`empty-${i}`} />;

              const isToday    = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
              const isSelected = selected === day;
              const hasTasks   = tasksOnDay(day).length > 0;
              const hasMeetings= meetingsOnDay(day).length > 0;

              return (
                <div
                  key={day}
                  onClick={() => setSelected(isSelected ? null : day)}
                  className={`min-h-[52px] rounded-lg p-1.5 cursor-pointer border transition-colors ${
                    isSelected ? 'border-blue-400 bg-blue-50' :
                    isToday    ? 'border-blue-200 bg-blue-50' :
                                 'border-gray-100 bg-white hover:border-gray-300'
                  }`}
                >
                  <p className={`text-xs font-medium ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>{day}</p>
                  <div className="flex gap-0.5 mt-1 flex-wrap">
                    {hasTasks    && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
                    {hasMeetings && <span className="w-1.5 h-1.5 rounded-full bg-green-400" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Side panel */}
        {selected && (
          <div className="w-64 bg-white rounded-xl shadow-sm p-4 flex flex-col gap-3">
            <p className="text-sm font-semibold text-gray-700">{MONTH_NAMES[month]} {selected}</p>

            {selTasks.length === 0 && selMeetings.length === 0 && (
              <p className="text-xs text-gray-400">Nothing scheduled.</p>
            )}

            {selTasks.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Tasks due</p>
                {selTasks.map(t => (
                  <div key={t.id} className="text-xs text-gray-700 py-1 border-b border-gray-50 last:border-0 truncate">
                    {t.title}
                  </div>
                ))}
              </div>
            )}

            {selMeetings.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Meetings</p>
                {selMeetings.map(r => (
                  <div key={r.id} className="text-xs text-gray-700 py-1 border-b border-gray-50 last:border-0 truncate">
                    {r.title}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex gap-5 text-xs text-gray-400">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block" /> Tasks due
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-400 inline-block" /> Approved meetings
        </span>
      </div>
    </div>
  );
}
