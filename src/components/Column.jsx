import { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import TaskCard from './TaskCard';
import AddTaskModal from './AddTaskModal';
import { WORKER_WIP_LIMIT } from '../data/mockData';
import { canCreateTask } from '../utils/permissions';

export default function Column({ columnName, tasks, allTasks, addTask, onRequestMeeting, onOpenDetail, onDelete, currentUser, isCompact }) {
  const [showModal, setShowModal] = useState(false);

  // ── Worker WIP computation ────────────────────────────────────────────────
  const countByUser = {};
  allTasks.filter(t => t.column === 'In Progress').forEach(t => {
    (t.assignedUserIds ?? []).forEach(uid => {
      countByUser[uid] = (countByUser[uid] ?? 0) + 1;
    });
  });
  const overloadedIds = Object.entries(countByUser)
    .filter(([, n]) => n > WORKER_WIP_LIMIT).map(([uid]) => uid);
  const atLimitIds    = Object.entries(countByUser)
    .filter(([, n]) => n === WORKER_WIP_LIMIT).map(([uid]) => uid);

  let banner = null;
  if (columnName === 'In Progress') {
    if (overloadedIds.length > 0) {
      banner = {
        cls:  'bg-red-50 text-red-700 border border-red-100',
        text: `⚠ ${overloadedIds.length} worker${overloadedIds.length > 1 ? 's' : ''} over limit (max ${WORKER_WIP_LIMIT})`,
      };
    } else if (atLimitIds.length > 0) {
      banner = {
        cls:  'bg-amber-50 text-amber-700 border border-amber-100',
        text: `${atLimitIds.length} worker${atLimitIds.length > 1 ? 's' : ''} at capacity`,
      };
    } else {
      banner = {
        cls:  'bg-green-50 text-green-700 border border-green-100',
        text: 'Healthy WIP',
      };
    }
  }

  return (
    <div className="bg-white rounded-xl border border-[rgba(22,25,22,0.12)] min-w-[300px] max-w-[350px] w-[300px] p-3 flex flex-col gap-2 shrink-0">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-sm text-gp-midnight">{columnName}</span>
          <span className="text-xs text-gp-fl3 font-normal">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</span>
        </div>
        <span className="bg-gp-cream text-gp-fl1 text-xs px-2 py-0.5 rounded-full font-semibold">
          {tasks.length}
        </span>
      </div>

      {banner && (
        <div className={`text-xs font-semibold px-3 py-1.5 rounded-lg mb-1 ${banner.cls}`}>
          {banner.text}
        </div>
      )}

      <Droppable droppableId={columnName}>
        {(provided) => (
          <div
            className="flex flex-col gap-2 min-h-[100px]"
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                overloadedUserIds={overloadedIds}
                onRequestMeeting={onRequestMeeting}
                onOpenDetail={onOpenDetail}
                onDelete={onDelete}
                currentUser={currentUser}
                isCompact={isCompact}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {canCreateTask(currentUser) && (
        <button
          onClick={() => setShowModal(true)}
          className="text-gp-fl2 hover:text-gp-midnight text-sm font-medium flex items-center justify-center mt-2 p-1 hover:bg-gp-sunrise rounded"
        >
          + Add
        </button>
      )}

      {showModal && (
        <AddTaskModal
          columnName={columnName}
          tasks={allTasks}
          onAdd={(task) => { addTask(task); setShowModal(false); }}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
