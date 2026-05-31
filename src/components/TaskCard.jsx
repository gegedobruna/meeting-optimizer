import { Draggable } from '@hello-pangea/dnd';
import { useState } from 'react';

export default function TaskCard({ task, index, onRequestMeeting, onOpenDetail }) {
  const [showInput, setShowInput] = useState(false);
  const [reasonValue, setReasonValue] = useState("");

  const getBorderColor = (priority) => {
    switch(priority) {
      case 'High': return 'border-l-4 border-red-500';
      case 'Medium': return 'border-l-4 border-yellow-400';
      case 'Low': return 'border-l-4 border-blue-400';
      default: return 'border-l-4 border-gray-400';
    }
  };

  const getBadgeStyle = (priority) => {
    switch(priority) {
      case 'High': return 'bg-red-100 text-red-700';
      case 'Medium': return 'bg-yellow-100 text-yellow-700';
      case 'Low': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleConfirm = (e) => {
    e.stopPropagation();
    if (reasonValue.trim() !== "") {
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
          className={`bg-white rounded-lg shadow-sm p-3 cursor-grab hover:shadow-md transition-shadow duration-150 ${getBorderColor(task.priority)} flex flex-col gap-1`}
        >
          <div className="font-medium text-sm text-gray-900">{task.title}</div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-gray-500">{task.assignee}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getBadgeStyle(task.priority)}`}>
              {task.priority}
            </span>
          </div>

          {task.column === "Blocked" && (
            <div className="mt-2 w-full" onClick={(e) => e.stopPropagation()}>
              {task.meetingRequest == null ? (
                <>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setShowInput(true); }}
                    className="mt-2 text-xs text-orange-600 border border-orange-300 rounded px-2 py-1 hover:bg-orange-50 w-full"
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
                <div className="mt-2 text-xs bg-orange-100 text-orange-700 rounded px-2 py-1 w-full text-center">
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
