import { Draggable } from '@hello-pangea/dnd';
import { useState } from 'react';
import { canDeleteTask } from '../utils/permissions';
import { getUsersByIds } from '../utils/users';
import { TEAMS } from '../data/mockData';

const PRIORITY_PILL = {
  Urgent: 'bg-red-500 text-white',
  High:   'bg-orange-400 text-white',
  Medium: 'bg-blue-400 text-white',
  Low:    'bg-gray-200 text-gray-700',
};

const getEscalationRing = (task) => {
  if (task.column !== "Blocked" || !task.blockedSince) return '';
  const hours = (Date.now() - new Date(task.blockedSince).getTime()) / 3_600_000;
  if (hours > 48) return 'ring-2 ring-red-300 animate-pulse';
  return '';
};

const formatDue = (dueDate) => {
  if (!dueDate) return 'No due date';
  return 'Due ' + new Date(dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getTeamName = (assignedUserIds) => {
  if (!assignedUserIds?.length) return null;
  const team = TEAMS.find(t => t.memberIds.includes(assignedUserIds[0]));
  return team?.name ?? null;
};

export default function TaskCard({ task, index, onRequestMeeting, onOpenDetail, onDelete, currentUser }) {
  const [showInput, setShowInput] = useState(false);
  const [reasonValue, setReasonValue] = useState('');

  const assignees  = getUsersByIds(task.assignedUserIds ?? []);
  const teamName   = getTeamName(task.assignedUserIds);
  const priorityPill = PRIORITY_PILL[task.priority] ?? 'bg-gray-200 text-gray-700';
  const ring       = getEscalationRing(task);

  const handleConfirm = (e) => {
    e.stopPropagation();
    if (reasonValue.trim()) {
      onRequestMeeting(task.id, reasonValue);
      setShowInput(false);
    }
  };

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onOpenDetail(task)}
          className={`relative group bg-white rounded-xl shadow-sm p-3 cursor-grab hover:shadow-md transition-shadow duration-150 flex flex-col gap-1.5 ${ring}`}
        >
          {/* Delete button — top left on hover */}
          {canDeleteTask(currentUser, task) && (
            <button
              className="absolute top-1.5 left-1.5 hidden group-hover:flex items-center justify-center bg-red-100 hover:bg-red-500 text-red-500 hover:text-white rounded p-1 transition-colors text-xs leading-none z-10"
              onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
            >
              ×
            </button>
          )}

          {/* Priority badge — top right */}
          <div className="flex justify-end">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${priorityPill}`}>
              {task.priority}
            </span>
          </div>

          {/* Title */}
          <p className="font-semibold text-sm text-gray-900 leading-snug">{task.title}</p>

          {/* Description preview */}
          {task.description ? (
            <p className="text-xs text-gray-400 leading-relaxed">
              {task.description.length > 70
                ? task.description.slice(0, 70) + '...'
                : task.description}
            </p>
          ) : null}

          {/* Team badge + due date */}
          <div className="flex items-center gap-2 flex-wrap mt-0.5">
            {teamName && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium">
                {teamName}
              </span>
            )}
            <span className="text-xs text-gray-400">{formatDue(task.dueDate)}</span>
          </div>

          {/* Bottom row: avatars + badges */}
          <div className="flex items-center justify-between gap-2 mt-0.5">
            <div className="flex items-center gap-1">
              {assignees.length === 0 ? (
                <span className="text-xs text-gray-300 italic">No assignees</span>
              ) : (
                assignees.map(u => (
                  <span
                    key={u.id}
                    title={u.name}
                    className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0"
                  >
                    {u.avatar}
                  </span>
                ))
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {task.fromMeeting && (
                <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-medium">
                  From Meeting
                </span>
              )}
              {task.column === 'Blocked' && (
                <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-medium">
                  Blocked
                </span>
              )}
            </div>
          </div>

          {/* Request Sync (Blocked column only) */}
          {task.column === 'Blocked' && (
            <div className="mt-1 w-full" onClick={(e) => e.stopPropagation()}>
              {task.meetingRequest == null ? (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowInput(true); }}
                    className="text-xs text-orange-600 border border-orange-300 rounded px-2 py-1 hover:bg-orange-50 w-full"
                  >
                    📅 Request Sync
                  </button>
                  {showInput && (
                    <div className="mt-1">
                      <input
                        placeholder="Why is a sync needed?"
                        maxLength={80}
                        value={reasonValue}
                        onChange={(e) => setReasonValue(e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 text-xs w-full mt-1"
                      />
                      <button
                        onClick={handleConfirm}
                        className="bg-orange-500 text-white text-xs rounded px-2 py-1 mt-1 w-full"
                      >
                        Confirm
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-xs bg-orange-100 text-orange-700 rounded px-2 py-1 w-full text-center">
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
