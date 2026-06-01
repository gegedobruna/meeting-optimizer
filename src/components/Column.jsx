import { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import TaskCard from './TaskCard';
import AddTaskModal from './AddTaskModal';
import { WIP_LIMIT } from '../data/mockData';
import { canCreateTask } from '../utils/permissions';

export default function Column({ columnName, tasks, addTask, onRequestMeeting, onOpenDetail, onDelete, currentUser }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm min-w-[220px] max-w-[220px] p-3 flex flex-col gap-2">
      <div className="flex items-center gap-2 font-bold mb-2">
        {columnName}
        <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
          {tasks.length}
        </span>
      </div>
      
      {columnName === "In Progress" && (
        <div className={`text-xs font-medium px-2 py-1 rounded mb-2 ${
          tasks.length <= WIP_LIMIT ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {tasks.length <= WIP_LIMIT 
            ? `WIP: ${tasks.length}/${WIP_LIMIT}`
            : `⚠ WIP: ${tasks.length}/${WIP_LIMIT}`
          }
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
              <TaskCard key={task.id} task={task} index={index} onRequestMeeting={onRequestMeeting} onOpenDetail={onOpenDetail} onDelete={onDelete} currentUser={currentUser} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {canCreateTask(currentUser) && (
        <button
          onClick={() => setShowModal(true)}
          className="text-gray-500 hover:text-gray-800 text-sm font-medium flex items-center justify-center mt-2 p-1 hover:bg-gray-100 rounded"
        >
          + Add
        </button>
      )}

      {showModal && (
        <AddTaskModal 
          columnName={columnName} 
          onAdd={(task) => {
            addTask(task);
            setShowModal(false);
          }} 
          onClose={() => setShowModal(false)} 
        />
      )}
    </div>
  );
}
