import { useState } from 'react';
import { COLUMNS } from '../data/mockData';
import { canEditTask, canDeleteTask } from '../utils/permissions';

export default function TaskDetailModal({ task, onClose, onSave, onDelete, currentUser }) {
  const [edited, setEdited] = useState({ ...task });

  const canEdit = canEditTask(currentUser, task);
  const canDel  = canDeleteTask(currentUser, task);

  const fieldClass = (base = "") =>
    `${base} border border-gray-200 rounded px-3 py-2 text-sm w-full ${!canEdit ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''}`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 flex flex-col gap-4">

        {/* Header */}
        <div className="flex justify-between items-center">
          <input
            className={`text-xl font-semibold border-b focus:border-gray-400 outline-none w-full pb-1 ${!canEdit ? 'border-gray-100 text-gray-400 cursor-not-allowed' : 'border-gray-200'}`}
            value={edited.title}
            onChange={(e) => setEdited({ ...edited, title: e.target.value })}
            readOnly={!canEdit}
          />
          <span
            className="text-gray-400 hover:text-gray-600 text-xl font-light cursor-pointer ml-4"
            onClick={onClose}
          >
            ✕
          </span>
        </div>

        {/* Read-only banner */}
        {!canEdit && (
          <div className="bg-amber-50 border border-amber-200 text-amber-700 text-xs rounded px-3 py-2">
            You have read-only access to this task.
          </div>
        )}

        {/* Fields */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 font-medium block mb-1">Assignee</label>
            <input
              className={fieldClass()}
              value={edited.assignee}
              onChange={(e) => setEdited({ ...edited, assignee: e.target.value })}
              readOnly={!canEdit}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium block mb-1">Priority</label>
            <select
              className={fieldClass()}
              value={edited.priority}
              onChange={(e) => setEdited({ ...edited, priority: e.target.value })}
              disabled={!canEdit}
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium block mb-1">Status</label>
            <select
              className={fieldClass()}
              value={edited.column}
              onChange={(e) => setEdited({ ...edited, column: e.target.value })}
              disabled={!canEdit}
            >
              {COLUMNS.map(col => <option key={col} value={col}>{col}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium block mb-1">Due Date</label>
            <input
              type="date"
              className={fieldClass()}
              value={edited.dueDate ?? ""}
              onChange={(e) => setEdited({ ...edited, dueDate: e.target.value || null })}
              readOnly={!canEdit}
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="text-xs text-gray-500 font-medium block mb-1">Description</label>
          <textarea
            className={fieldClass("resize-none")}
            rows={4}
            placeholder="Add a description..."
            value={edited.description ?? ""}
            onChange={(e) => setEdited({ ...edited, description: e.target.value })}
            readOnly={!canEdit}
          />
        </div>

        {/* Meeting Request */}
        {task.column === "Blocked" && (
          <div>
            <label className="text-xs text-gray-500 font-medium block mb-1">Sync Request</label>
            {edited.meetingRequest !== null ? (
              <div className="flex items-center">
                <span className="text-gray-600 italic text-sm">{edited.meetingRequest}</span>
                {canEdit && (
                  <button
                    className="text-xs text-red-400 underline ml-2"
                    onClick={() => setEdited({ ...edited, meetingRequest: null })}
                  >
                    Clear
                  </button>
                )}
              </div>
            ) : (
              <input
                className={fieldClass()}
                placeholder="Request a sync — state reason"
                maxLength={80}
                value={edited.meetingRequest || ""}
                onChange={(e) => setEdited({ ...edited, meetingRequest: e.target.value || null })}
                readOnly={!canEdit}
              />
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between items-center mt-2">
          <div>
            {canDel && (
              <button
                className="text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg px-4 py-2"
                onClick={() => { onDelete(task.id); onClose(); }}
              >
                Delete Task
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2"
              onClick={onClose}
            >
              Cancel
            </button>
            {canEdit && (
              <button
                className="text-sm bg-gray-900 text-white rounded-lg px-4 py-2 hover:bg-gray-700"
                onClick={() => { onSave(edited); onClose(); }}
              >
                Save Changes
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
