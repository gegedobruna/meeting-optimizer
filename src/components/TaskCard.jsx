import { Draggable } from '@hello-pangea/dnd';
import { useState } from 'react';
import { canDeleteTask } from '../utils/permissions';
import { getUsersByIds } from '../utils/users';
import { TEAMS } from '../data/mockData';

const PRIORITY_ACCENT = {
  Urgent: 'border-l-4 border-l-red-500',
  High:   'border-l-4 border-l-amber-500',
  Medium: 'border-l-4 border-l-blue-500',
  Low:    'border-l-4 border-l-slate-300',
};

const PRIORITY_PILL = {
  Urgent: 'bg-red-50 text-red-600',
  High:   'bg-amber-50 text-amber-600',
  Medium: 'bg-blue-50 text-blue-600',
  Low:    'bg-slate-100 text-slate-500',
};

const PRIORITY_DOT = {
  Urgent: 'bg-red-500',
  High:   'bg-amber-500',
  Medium: 'bg-blue-500',
  Low:    'bg-slate-300',
};

const getEscalationRing = (task) => {
  if (task.column !== 'Blocked' || !task.blockedSince) return '';
  const hours = (Date.now() - new Date(task.blockedSince).getTime()) / 3_600_000;
  return hours > 48 ? 'ring-2 ring-red-300 animate-pulse' : '';
};

const formatDue = (dueDate) => {
  if (!dueDate) return 'No due date';
  return 'Due ' + new Date(dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getTeamName = (assignedUserIds) => {
  if (!assignedUserIds?.length) return null;
  return TEAMS.find(t => t.memberIds.includes(assignedUserIds[0]))?.name ?? null;
};

export default function TaskCard({ task, index, overloadedUserIds, onRequestMeeting, onOpenDetail, onDelete, currentUser, isCompact }) {
  const [showInput,     setShowInput]     = useState(false);
  const [reasonValue,   setReasonValue]   = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const assignees    = getUsersByIds(task.assignedUserIds ?? []);
  const teamName     = getTeamName(task.assignedUserIds);
  const accent       = PRIORITY_ACCENT[task.priority] ?? 'border-l-4 border-l-slate-300';
  const pill         = PRIORITY_PILL[task.priority]   ?? 'bg-slate-100 text-slate-500';
  const dot          = PRIORITY_DOT[task.priority]    ?? 'bg-slate-300';
  const ring         = getEscalationRing(task);
  const isOverloaded = (overloadedUserIds ?? []).some(uid => (task.assignedUserIds ?? []).includes(uid));

  const extra        = assignees.length - 3;

  const handleConfirm = (e) => {
    e.stopPropagation();
    if (reasonValue.trim()) {
      onRequestMeeting(task.id, reasonValue);
      setShowInput(false);
    }
  };

  // ── Compact card ──────────────────────────────────────────────────────────
  if (isCompact) {
    return (
      <Draggable draggableId={task.id} index={index}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            onClick={() => onOpenDetail(task)}
            className={`group bg-white rounded-lg border border-[rgba(22,25,22,0.10)] px-3 py-2.5 cursor-grab hover:shadow-sm transition-shadow flex items-center gap-2.5 ${accent} ${ring}`}
          >
            {/* Priority dot */}
            <span className={`w-2 h-2 rounded-full shrink-0 ${dot}`} />

            {/* Title */}
            <p className="text-sm font-medium text-gp-midnight flex-1 truncate">{task.title}</p>

            {/* Delete (hover) */}
            {canDeleteTask(currentUser, task) && (
              <div className="shrink-0" onClick={e => e.stopPropagation()}>
                {confirmDelete ? (
                  <div className="flex items-center gap-1">
                    <button onClick={() => onDelete(task.id)} className="text-xs bg-red-500 text-white rounded px-1.5 py-0.5">Yes</button>
                    <button onClick={() => setConfirmDelete(false)} className="text-xs bg-slate-100 text-slate-500 rounded px-1.5 py-0.5">No</button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="hidden group-hover:flex items-center justify-center w-4 h-4 rounded-full text-slate-300 hover:bg-red-50 hover:text-red-500 text-base leading-none"
                  >
                    ×
                  </button>
                )}
              </div>
            )}

            {/* Facepile */}
            {assignees.length > 0 && (
              <div className="flex -space-x-1.5 shrink-0">
                {assignees.slice(0, 3).map(u => (
                  <span key={u.id} title={u.name}
                    className="w-5 h-5 rounded-full bg-gp-cream text-gp-midnight text-[10px] font-bold flex items-center justify-center ring-1 ring-white"
                  >
                    {u.avatar}
                  </span>
                ))}
                {extra > 0 && (
                  <span className="w-5 h-5 rounded-full bg-gp-fl3 text-white text-[10px] font-bold flex items-center justify-center ring-1 ring-white">
                    +{extra}
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </Draggable>
    );
  }

  // ── Full card ─────────────────────────────────────────────────────────────
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onOpenDetail(task)}
          className={`group bg-white rounded-xl shadow-sm border border-[rgba(22,25,22,0.10)] p-4 cursor-grab hover:shadow-md transition-shadow duration-150 flex flex-col gap-3 ${accent} ${ring}`}
        >
          {/* Title row */}
          <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
            <p
              className="font-semibold text-sm text-gp-midnight line-clamp-1 flex-1 cursor-grab"
              onClick={e => { e.stopPropagation(); onOpenDetail(task); }}
            >
              {task.title}
            </p>

            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${pill}`}>
              {task.priority}
            </span>

            {canDeleteTask(currentUser, task) && (
              confirmDelete ? (
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-xs text-red-500 font-medium">Sure?</span>
                  <button
                    onClick={() => onDelete(task.id)}
                    className="text-xs bg-red-500 hover:bg-red-600 text-white rounded px-1.5 py-0.5 font-semibold transition-colors"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-500 rounded px-1.5 py-0.5 font-semibold transition-colors"
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="hidden group-hover:flex items-center justify-center w-5 h-5 rounded-full text-slate-300 hover:bg-red-50 hover:text-red-500 transition-colors text-base leading-none shrink-0"
                >
                  ×
                </button>
              )
            )}
          </div>

          {/* Description */}
          {task.description && (
            <p className="text-xs text-gp-fl2 line-clamp-2 mt-1 leading-relaxed">
              {task.description}
            </p>
          )}

          {/* Divider + metadata */}
          <div className="border-t border-[rgba(22,25,22,0.06)] pt-3 mt-1 flex flex-col gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              {teamName && (
                <span className="text-xs bg-gp-cream text-gp-fl1 px-2 py-0.5 rounded-md font-medium">
                  {teamName}
                </span>
              )}
              <span className="text-xs text-gp-fl3">{formatDue(task.dueDate)}</span>
              {task.fromMeeting && (
                <span className="text-xs bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded-full font-medium">
                  From Meeting
                </span>
              )}
              {task.column === 'Blocked' && (
                <span className="text-xs bg-red-50 text-red-500 px-1.5 py-0.5 rounded-full font-medium">
                  Blocked
                </span>
              )}
            </div>

            {/* Facepile + overload badge */}
            <div className="flex items-center justify-between gap-2">
              {assignees.length === 0 ? (
                <span className="text-xs text-gp-fl3 italic">No assignees</span>
              ) : (
                <div className="flex -space-x-1.5 overflow-hidden">
                  {assignees.slice(0, 3).map(u => (
                    <span
                      key={u.id}
                      title={u.name}
                      className="w-6 h-6 rounded-full bg-gp-cream text-gp-midnight text-xs font-bold flex items-center justify-center ring-2 ring-white shrink-0"
                    >
                      {u.avatar}
                    </span>
                  ))}
                  {extra > 0 && (
                    <span className="w-6 h-6 rounded-full bg-gp-fl3 text-white text-xs font-bold flex items-center justify-center ring-2 ring-white shrink-0">
                      +{extra}
                    </span>
                  )}
                </div>
              )}
              {isOverloaded && (
                <span className="text-xs bg-orange-50 text-orange-600 border border-orange-100 px-1.5 py-0.5 rounded-full font-semibold shrink-0">
                  ⚠ Overloaded
                </span>
              )}
            </div>
          </div>

          {/* Request Sync */}
          {task.column === 'Blocked' && (
            <div className="w-full" onClick={(e) => e.stopPropagation()}>
              {task.meetingRequest == null ? (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowInput(true); }}
                    className="text-xs text-orange-600 border border-orange-200 rounded-lg px-2 py-1 hover:bg-orange-50 w-full"
                  >
                    📅 Request Sync
                  </button>
                  {showInput && (
                    <div className="mt-1.5 flex flex-col gap-1">
                      <input
                        placeholder="Why is a sync needed?"
                        maxLength={80}
                        value={reasonValue}
                        onChange={(e) => setReasonValue(e.target.value)}
                        className="border border-slate-200 rounded-lg px-2 py-1 text-xs w-full"
                      />
                      <button
                        onClick={handleConfirm}
                        className="bg-orange-500 text-white text-xs rounded-lg px-2 py-1 w-full"
                      >
                        Confirm
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-xs bg-orange-50 text-orange-600 rounded-lg px-2 py-1 w-full text-center">
                  📅 Sync Requested
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
}
