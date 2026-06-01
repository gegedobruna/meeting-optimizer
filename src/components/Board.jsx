import { DragDropContext } from '@hello-pangea/dnd';
import { useState, useMemo } from 'react';
import Column from './Column';
import AgendaPanel from './AgendaPanel';
import TaskDetailModal from './TaskDetailModal';
import { COLUMNS, TEAMS, ROLES } from '../data/mockData';
import { canDragTask } from '../utils/permissions';

export default function Board({ tasks, setTasks, showAgenda, setShowAgenda, currentUser }) {
  const [selectedTask,     setSelectedTask]     = useState(null);
  const [dragWarning,      setDragWarning]      = useState(null);
  const [showAllTeams,     setShowAllTeams]     = useState(false);
  const [adminTeamFilter,  setAdminTeamFilter]  = useState('all'); // 'all' | team id
  const [isCompact,        setIsCompact]        = useState(false);

  const isAdmin  = currentUser.role === ROLES.ADMIN;
  const isLead   = currentUser.role === ROLES.TEAM_LEAD;
  const myTeam   = TEAMS.find(t => t.id === currentUser.teamId) ?? null;

  // ── Task visibility scoping ───────────────────────────────────────────────
  const visibleTasks = useMemo(() => {
    if (isAdmin) {
      if (adminTeamFilter === 'all') return tasks;
      const filtered = TEAMS.find(t => t.id === adminTeamFilter);
      if (!filtered) return tasks;
      return tasks.filter(t => {
        const ids = t.assignedUserIds ?? [];
        if (ids.length === 0) return true;
        return ids.some(uid => filtered.memberIds.includes(uid));
      });
    }
    if (isLead && showAllTeams) return tasks;
    if (!myTeam) return tasks;
    return tasks.filter(t => {
      const ids = t.assignedUserIds ?? [];
      if (ids.length === 0) return isLead;
      return ids.some(uid => myTeam.memberIds.includes(uid));
    });
  }, [tasks, isAdmin, isLead, showAllTeams, adminTeamFilter, myTeam]);

  // ── Drag & drop ───────────────────────────────────────────────────────────
  const onDragEnd = (result) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const taskIndex = tasks.findIndex(t => t.id === draggableId);
    if (taskIndex === -1) return;

    const task = tasks[taskIndex];
    if (!canDragTask(currentUser, task)) {
      setDragWarning('You can only move your own tasks.');
      setTimeout(() => setDragWarning(null), 3000);
      return;
    }

    const updatedTask = { ...task, column: destination.droppableId };
    if (destination.droppableId === 'Blocked' && source.droppableId !== 'Blocked') {
      updatedTask.blockedSince = new Date().toISOString();
    } else if (destination.droppableId !== 'Blocked') {
      updatedTask.blockedSince = null;
    }

    const newTasks = [...tasks];
    newTasks[taskIndex] = updatedTask;
    setTasks(newTasks);
  };

  const addTask            = (task)        => setTasks(prev => [...prev, task]);
  const handleMeetingRequest = (taskId, reason) =>
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, meetingRequest: reason } : t));
  const deleteTask         = (taskId)      => setTasks(prev => prev.filter(t => t.id !== taskId));
  const handleSaveTask     = (updatedTask) =>
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));

  return (
    <div>
      {/* ── Header — lives outside the scroll box, never moves ── */}
      <div className="bg-gp-sunrise px-5 pt-4 pb-3 border-b border-[rgba(22,25,22,0.08)]">
        <p className="text-[10px] font-semibold text-gp-fl3 uppercase tracking-widest mb-0.5">Team Board</p>
        <h1 className="text-xl font-bold text-gp-midnight leading-tight">Kanban workflow</h1>

        <div className="flex items-center gap-2 mt-2">
          {/* Compact toggle — leftmost */}
          <button
            onClick={() => setIsCompact(c => !c)}
            className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors shrink-0 ${
              isCompact
                ? 'bg-gp-midnight text-white border-gp-midnight'
                : 'bg-white text-gp-fl2 border-[rgba(22,25,22,0.12)] hover:text-gp-midnight hover:border-gp-fl3'
            }`}
          >
            <svg width="12" height="12" viewBox="0 0 13 13" fill="none" className="shrink-0">
              <rect x="0" y="1" width="13" height="2" rx="1" fill="currentColor"/>
              <rect x="0" y="5.5" width="13" height="2" rx="1" fill="currentColor"/>
              <rect x="0" y="10" width="13" height="2" rx="1" fill="currentColor"/>
            </svg>
            Compact
          </button>

          <span className="w-px h-3.5 bg-[rgba(22,25,22,0.12)] shrink-0" />
          <span className="text-xs text-gp-fl2 shrink-0">Showing:</span>

          {isAdmin && (
            <select
              value={adminTeamFilter}
              onChange={e => setAdminTeamFilter(e.target.value)}
              className="text-xs font-medium text-gp-midnight border border-[rgba(22,25,22,0.12)] rounded-lg px-2 py-0.5 bg-white focus:outline-none focus:ring-2 focus:ring-gp-coral/20 focus:border-gp-coral cursor-pointer"
            >
              <option value="all">All Teams</option>
              {TEAMS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          )}

          {isLead && (
            <div className="flex items-center bg-gp-cream rounded-lg p-0.5 gap-0.5">
              <button
                onClick={() => setShowAllTeams(false)}
                className={`px-2.5 py-0.5 rounded-md text-xs font-semibold transition-colors ${
                  !showAllTeams ? 'bg-white text-gp-midnight shadow-sm' : 'text-gp-fl2 hover:text-gp-midnight'
                }`}
              >{myTeam?.name ?? 'My Team'}</button>
              <button
                onClick={() => setShowAllTeams(true)}
                className={`px-2.5 py-0.5 rounded-md text-xs font-semibold transition-colors ${
                  showAllTeams ? 'bg-white text-gp-midnight shadow-sm' : 'text-gp-fl2 hover:text-gp-midnight'
                }`}
              >All Teams</button>
            </div>
          )}

          {!isAdmin && !isLead && (
            <span className="text-xs font-medium text-gp-fl1">{myTeam?.name ?? 'All'}</span>
          )}
        </div>
      </div>

      {/* ── Columns — only this box scrolls horizontally ── */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div
          className={`flex flex-row gap-3 p-4 overflow-x-auto pb-6 ${showAgenda ? 'pr-80' : ''}`}
          style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(22,25,22,0.15) transparent' }}
        >
          {COLUMNS.map(columnName => (
            <Column
              key={columnName}
              columnName={columnName}
              tasks={visibleTasks.filter(t => t.column === columnName)}
              allTasks={visibleTasks}
              addTask={addTask}
              onRequestMeeting={handleMeetingRequest}
              onOpenDetail={t => setSelectedTask(t)}
              onDelete={deleteTask}
              currentUser={currentUser}
              isCompact={isCompact}
            />
          ))}
        </div>

        {selectedTask && (
          <TaskDetailModal
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
            onSave={handleSaveTask}
            onDelete={(taskId) => { deleteTask(taskId); setSelectedTask(null); }}
            currentUser={currentUser}
          />
        )}
      </DragDropContext>

      <AgendaPanel tasks={visibleTasks} showAgenda={showAgenda} setShowAgenda={setShowAgenda} />

      {dragWarning && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded shadow-lg z-50 text-sm font-medium">
          {dragWarning}
        </div>
      )}
    </div>
  );
}
