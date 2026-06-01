import { useState } from 'react';
import { USERS, COLUMNS } from '../data/mockData';

function parseActionItems(text) {
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(line =>
      line.length > 3 &&
      !line.startsWith('#') &&
      !line.match(/^[-–—]{3,}$/)
    );
}

export default function MeetingNotes({ currentUser, addTask }) {
  const [notes, setNotes]   = useState('');
  const [items, setItems]   = useState([]);  // [{ title, assigneeId, column, priority, added }]
  const [parsed, setParsed] = useState(false);

  const handleExtract = () => {
    const titles = parseActionItems(notes);
    setItems(titles.map(title => ({
      title,
      assigneeId: currentUser.id,
      column:     "To Do",
      priority:   "Medium",
      added:      false,
    })));
    setParsed(true);
  };

  const updateItem = (i, patch) =>
    setItems(prev => prev.map((it, idx) => idx === i ? { ...it, ...patch } : it));

  const dismissItem = (i) =>
    setItems(prev => prev.filter((_, idx) => idx !== i));

  const handleAdd = (i) => {
    const it = items[i];
    addTask({
      id:              `t${Date.now()}-${i}`,
      title:           it.title,
      assignedUserIds: [it.assigneeId],
      priority:        it.priority,
      column:          it.column,
      meetingRequest:  null,
      description:     "",
      blockedSince:    null,
      dueDate:         null,
      fromMeeting:     true,
    });
    updateItem(i, { added: true });
  };

  return (
    <div className="p-6 max-w-3xl mx-auto flex flex-col gap-6">
      <h2 className="text-lg font-semibold text-gray-800">Meeting Notes</h2>

      {/* Notes textarea */}
      <div className="bg-white rounded-xl shadow-sm p-5 flex flex-col gap-3">
        <label className="text-xs text-gray-500 font-medium">
          Paste your notes below. Headings (lines starting with #) and dividers are automatically excluded.
        </label>
        <textarea
          className="border border-gray-200 rounded px-3 py-2 text-sm resize-none font-mono"
          rows={10}
          placeholder="Paste raw meeting notes here. Every line becomes an action item — dismiss the ones you don't need."
          value={notes}
          onChange={e => { setNotes(e.target.value); setParsed(false); setItems([]); }}
        />
        <button
          onClick={handleExtract}
          className="self-start bg-gray-900 hover:bg-gray-700 text-white text-sm rounded-lg px-5 py-2 font-medium"
        >
          Parse Notes
        </button>
      </div>

      {/* Parsed items */}
      {parsed && (
        <div className="bg-white rounded-xl shadow-sm p-5 flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-gray-700">
            {items.length === 0
              ? 'No lines were extracted — make sure your notes contain at least one non-heading line.'
              : `${items.length} action item${items.length > 1 ? 's' : ''} found`}
          </h3>

          {items.map((it, i) => (
            <div
              key={i}
              className={`border border-gray-100 rounded-lg p-3 flex flex-col gap-2 bg-gray-50 transition-opacity ${it.added ? 'opacity-50' : ''}`}
            >
              {/* Title row with dismiss button */}
              <div className="flex items-center gap-2">
                <input
                  className="border border-gray-200 rounded px-2 py-1.5 text-sm flex-1 bg-white"
                  value={it.title}
                  onChange={e => updateItem(i, { title: e.target.value })}
                  disabled={it.added}
                />
                {!it.added && (
                  <button
                    onClick={() => dismissItem(i)}
                    className="text-gray-400 hover:text-gray-700 text-base leading-none px-1 shrink-0"
                    title="Dismiss"
                  >
                    ×
                  </button>
                )}
              </div>

              <div className="flex gap-2 items-center flex-wrap">
                {/* Assignee */}
                <select
                  className="border border-gray-200 rounded px-2 py-1.5 text-xs bg-white"
                  value={it.assigneeId}
                  onChange={e => updateItem(i, { assigneeId: e.target.value })}
                  disabled={it.added}
                >
                  {USERS.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>

                {/* Column */}
                <select
                  className="border border-gray-200 rounded px-2 py-1.5 text-xs bg-white"
                  value={it.column}
                  onChange={e => updateItem(i, { column: e.target.value })}
                  disabled={it.added}
                >
                  {COLUMNS.map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>

                {/* Priority */}
                <select
                  className="border border-gray-200 rounded px-2 py-1.5 text-xs bg-white"
                  value={it.priority}
                  onChange={e => updateItem(i, { priority: e.target.value })}
                  disabled={it.added}
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>

                {/* Add / Added */}
                {it.added ? (
                  <span className="text-xs text-green-600 font-medium">Added ✓</span>
                ) : (
                  <button
                    onClick={() => handleAdd(i)}
                    className="text-xs bg-blue-600 hover:bg-blue-700 text-white rounded px-3 py-1.5 font-medium"
                  >
                    Add to Board
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
