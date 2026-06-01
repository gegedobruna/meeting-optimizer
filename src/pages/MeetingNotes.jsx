import { useState } from 'react';
import { USERS, COLUMNS } from '../data/mockData';

const ACTION_RE = /^(\s*[-*]\s*\[[\s ]\]|TODO:|Action:)\s*/i;

function parseActionItems(text) {
  return text
    .split('\n')
    .filter(line => ACTION_RE.test(line.trim()))
    .map(line => line.trim().replace(ACTION_RE, '').trim())
    .filter(Boolean);
}

export default function MeetingNotes({ currentUser, addTask }) {
  const [notes, setNotes]   = useState('');
  const [items, setItems]   = useState([]);  // [{ title, assigneeId, column, added }]
  const [parsed, setParsed] = useState(false);

  const handleExtract = () => {
    const titles = parseActionItems(notes);
    setItems(titles.map(title => ({
      title,
      assigneeId: currentUser.id,
      column: "To Do",
      added: false,
    })));
    setParsed(true);
  };

  const updateItem = (i, patch) =>
    setItems(prev => prev.map((it, idx) => idx === i ? { ...it, ...patch } : it));

  const handleAdd = (i) => {
    const it   = items[i];
    const user = USERS.find(u => u.id === it.assigneeId);
    addTask({
      id:             `t${Date.now()}-${i}`,
      title:          it.title,
      assignee:       user ? user.name : currentUser.name,
      priority:       "Medium",
      column:         it.column,
      meetingRequest: null,
      description:    "",
      blockedSince:   null,
      fromMeeting:    true,
    });
    updateItem(i, { added: true });
  };

  return (
    <div className="p-6 max-w-3xl mx-auto flex flex-col gap-6">
      <h2 className="text-lg font-semibold text-gray-800">Meeting Notes</h2>

      {/* Notes textarea */}
      <div className="bg-white rounded-xl shadow-sm p-5 flex flex-col gap-3">
        <label className="text-xs text-gray-500 font-medium">
          Paste your meeting notes below. Lines starting with{' '}
          <code className="bg-gray-100 px-1 rounded">- [ ]</code>,{' '}
          <code className="bg-gray-100 px-1 rounded">* [ ]</code>,{' '}
          <code className="bg-gray-100 px-1 rounded">TODO:</code>, or{' '}
          <code className="bg-gray-100 px-1 rounded">Action:</code> will be extracted.
        </label>
        <textarea
          className="border border-gray-200 rounded px-3 py-2 text-sm resize-none font-mono"
          rows={10}
          placeholder={"Meeting notes...\n- [ ] Schedule design review\nTODO: Update changelog\nAction: Send summary to stakeholders"}
          value={notes}
          onChange={e => { setNotes(e.target.value); setParsed(false); setItems([]); }}
        />
        <button
          onClick={handleExtract}
          className="self-start bg-gray-900 hover:bg-gray-700 text-white text-sm rounded-lg px-5 py-2 font-medium"
        >
          Extract Action Items
        </button>
      </div>

      {/* Parsed items */}
      {parsed && (
        <div className="bg-white rounded-xl shadow-sm p-5 flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-gray-700">
            {items.length === 0 ? 'No action items found.' : `${items.length} action item${items.length > 1 ? 's' : ''} found`}
          </h3>

          {items.map((it, i) => (
            <div key={i} className="border border-gray-100 rounded-lg p-3 flex flex-col gap-2 bg-gray-50">
              {/* Title */}
              <input
                className="border border-gray-200 rounded px-2 py-1.5 text-sm w-full bg-white"
                value={it.title}
                onChange={e => updateItem(i, { title: e.target.value })}
                disabled={it.added}
              />

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

                {/* Add button */}
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
