---
date: 2026-06-01
last_change: Verified localStorage persistence (storage.js + App.jsx useEffect) and AddTaskModal full task shape are live; updated state to reflect both as implemented.
---

## System Purpose
A React/Vite Kanban board designed to help small teams manage tasks across workflow stages while surfacing meeting-necessity signals — blocked tasks can trigger "sync requests" that appear in a collapsible Meeting Agenda panel, letting teams decide whether a standup is needed.

## Architecture Summary
- **Stack:** React 18 + Vite + Tailwind CSS + @hello-pangea/dnd (drag-and-drop)
- **State:** All state lives in `App.jsx` (tasks array, agenda visibility); persisted to localStorage via `src/utils/storage.js`
- **Data:** Hardcoded mock data in `src/data/mockData.js` (tasks, columns, agenda items, WIP limit)
- **Rendering:** `App` → `Board` → `Column[]` + `AgendaPanel`; modals rendered inside Board
- **No routing, no backend, no auth**

## Existing Features
- 6-column Kanban board (Backlog, To Do, In Progress, Blocked, Review, Done)
- Drag-and-drop task movement between columns
- WIP limit indicator on "In Progress" (limit=3, visual warning if exceeded)
- Task cards with priority color coding (High/Medium/Low)
- Add Task modal (title, assignee, priority; placed in selected column)
- Task Detail modal (edit title, assignee, priority, status, description, sync request)
- "Request Sync" flow on Blocked cards (inline input → stores reason on task)
- AgendaPanel (fixed right sidebar): static agenda items + dynamic sync request list
- Smart banner: warns if sync requested; suggests skipping if all tasks in Review/Done
- Toggle to show/hide AgendaPanel

## Missing Features
- Agenda items are fully static (hardcoded, cannot add/edit/remove)
- No task deletion
- WIP limit is not enforced — only visual warning
- No filtering or search
- No multi-user / real-time collaboration
- No date/due-date fields on tasks
- No drag reordering within a column (only column changes tracked)
- No notifications or reminders
- No export (meeting notes, agenda PDF, etc.)

## Broken / Uncertain Areas
- `TaskDetailModal` sync-request section only renders when `task.column === "Blocked"` (original column), not `edited.column` — editing status away from Blocked mid-modal may leave stale sync request
- `plan/tasks.md` exists but is empty
- `work/context.md` exists but content unknown

## Key Modules & Responsibilities
| File | Responsibility |
|------|---------------|
| `src/App.jsx` | Root state (tasks, agenda visibility); layout shell |
| `src/data/mockData.js` | All seed data + constants (COLUMNS, WIP_LIMIT, INITIAL_TASKS, AGENDA_ITEMS) |
| `src/components/Board.jsx` | DragDropContext, drag logic, task CRUD handlers, modal orchestration |
| `src/components/Column.jsx` | Droppable container, WIP badge, Add button |
| `src/components/TaskCard.jsx` | Draggable card, priority styling, inline sync-request UI |
| `src/components/AgendaPanel.jsx` | Fixed sidebar, static agenda, sync request list, smart banner |
| `src/components/AddTaskModal.jsx` | New task creation form (produces full task shape: id, title, assignee, priority, column, meetingRequest: null, description: "") |
| `src/utils/storage.js` | localStorage helpers: `loadFromStorage` (init with fallback) + `saveToStorage` (silent on quota errors) |
| `src/components/TaskDetailModal.jsx` | Full task edit (title, assignee, priority, status, description, sync) |
