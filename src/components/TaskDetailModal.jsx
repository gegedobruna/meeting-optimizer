import { useState } from 'react';
import { COLUMNS } from '../data/mockData';

export default function TaskDetailModal({ task, onClose, onSave }) {
  const [edited, setEdited] = useState({ ...task });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 flex flex-col gap-4">
        {/* Header section */}
        <div className="flex justify-between items-center">
          <input 
            className="text-xl font-semibold border-b border-gray-200 focus:border-gray-400 outline-none w-full pb-1"
            value={edited.title}
            onChange={(e) => setEdited({ ...edited, title: e.target.value })}
          />
          <span 
            className="text-gray-400 hover:text-gray-600 text-xl font-light cursor-pointer ml-4"
            onClick={onClose}
          >
            ✕
          </span>
        </div>

        {/* Fields section */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 font-medium block mb-1">Assignee</label>
            <input 
              className="border border-gray-200 rounded px-3 py-2 text-sm w-full"
              value={edited.assignee}
              onChange={(e) => setEdited({ ...edited, assignee: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium block mb-1">Priority</label>
            <select 
              className="border border-gray-200 rounded px-3 py-2 text-sm w-full"
              value={edited.priority}
              onChange={(e) => setEdited({ ...edited, priority: e.target.value })}
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium block mb-1">Status</label>
            <select 
              className="border border-gray-200 rounded px-3 py-2 text-sm w-full"
              value={edited.column}
              onChange={(e) => setEdited({ ...edited, column: e.target.value })}
            >
              {COLUMNS.map(col => <option key={col} value={col}>{col}</option>)}
            </select>
          </div>
          <div></div>
        </div>

        {/* Description section */}
        <div>
          <label className="text-xs text-gray-500 font-medium block mb-1">Description</label>
          <textarea 
            className="border border-gray-200 rounded px-3 py-2 text-sm w-full resize-none"
            rows={4}
            placeholder="Add a description..."
            value={edited.description ?? ""}
            onChange={(e) => setEdited({ ...edited, description: e.target.value })}
          />
        </div>

        {/* Meeting Request section */}
        {task.column === "Blocked" && (
          <div>
            <label className="text-xs text-gray-500 font-medium block mb-1">Sync Request</label>
            {edited.meetingRequest !== null ? (
              <div className="flex items-center">
                <span className="text-gray-600 italic text-sm">{edited.meetingRequest}</span>
                <button 
                  className="text-xs text-red-400 underline ml-2"
                  onClick={() => setEdited({ ...edited, meetingRequest: null })}
                >
                  Clear
                </button>
              </div>
            ) : (
              <input 
                className="border border-gray-200 rounded px-3 py-2 text-sm w-full"
                placeholder="Request a sync — state reason"
                maxLength={80}
                value={edited.meetingRequest || ""}
                onChange={(e) => setEdited({ ...edited, meetingRequest: e.target.value || null })}
              />
            )}
          </div>
        )}

        {/* Footer section */}
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-gray-300">{task.id}</span>
          <div className="flex gap-2">
            <button 
              className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2"
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              className="text-sm bg-gray-900 text-white rounded-lg px-4 py-2 hover:bg-gray-700"
              onClick={() => { onSave(edited); onClose(); }}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
