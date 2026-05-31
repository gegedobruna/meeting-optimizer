import { useState } from 'react';

export default function AddTaskModal({ columnName, onAdd, onClose }) {
  const [title, setTitle] = useState('');
  const [assignee, setAssignee] = useState('');
  const [priority, setPriority] = useState('Medium');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !assignee.trim()) return;
    
    onAdd({
      id: "t" + Date.now(),
      title,
      assignee,
      priority,
      column: columnName,
      meetingRequest: null,
      description: "",
    });
    // onClose is called in Column.jsx when onAdd is called, or we can just call it here.
    // The instructions say: "Then call onClose". I will call both.
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-80 flex flex-col gap-3">
        <h3 className="font-bold text-lg mb-2">Add Task to {columnName}</h3>
        <input 
          className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
          placeholder="Task Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />
        <input 
          className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
          placeholder="Assignee"
          value={assignee}
          onChange={(e) => setAssignee(e.target.value)}
        />
        <select 
          className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
        
        <div className="flex justify-end gap-2 mt-4">
          <button 
            className="text-gray-500 text-sm font-medium px-4 py-2"
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            className="bg-gray-900 text-white rounded px-4 py-2 text-sm font-medium"
            onClick={handleSubmit}
          >
            Add Task
          </button>
        </div>
      </div>
    </div>
  );
}
