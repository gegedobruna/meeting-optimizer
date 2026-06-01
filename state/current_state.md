---
date: 2026-06-01
last_change: Phase 2 complete — permission-gated drag-and-drop (toast on unauthorized move), conditional Create/Delete UI by role, read-only TaskDetailModal for non-owners, and blockedSince escalation indicators (yellow/orange/red+pulse) on Blocked cards.
---

## System Purpose
A React/Vite Kanban board designed to help small teams manage tasks across workflow stages while surfacing meeting-necessity signals — blocked tasks can trigger "sync requests" that appear in a collapsible Meeting Agenda panel, letting teams decide whether a standup is needed.

## Architecture Summary
- **Stack:** React 18 + Vite + Tailwind CSS + @hello-pangea/dnd (drag-and-drop)
- **State:** All state lives in `App.jsx` (tasks, showAgenda, currentUser, activePage); persisted to localStorage via `src/utils/storage.js`
- **Data:** Mock data in `src/data/mockData.js` (tasks, columns, agenda items, WIP limit, ROLES, USERS, TEAMS, NAV_ITEMS)
- **Auth:** Login screen gates the shell; session stored as `mo_current_user` (user id) in localStorage
- **Routing:** `activePage` string state in App.jsx; Sidebar nav calls `setActivePage`; no React Router
- **Rendering:** `App` → `Login` (unauthenticated) | `Sidebar` + `Board`/placeholder (authenticated)

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
- Task deletion via TaskDetailModal footer button and TaskCard hover × button
- **[Phase 1] Login screen** with credential validation against USERS mock data
- **[Phase 1] Fixed left Sidebar** with avatar initials, color-coded role badge, role-filtered nav, active page highlight, logout
- **[Phase 1] Role-based navigation** — TEAM_MEMBER sees 6 items; TEAM_LEAD/ADMIN see 8 (Teams + Analytics added)
- **[Phase 1] Session persistence** — currentUser restored from localStorage on reload

## Phase 1 Additions — Key Modules
| File | Responsibility |
|------|---------------|
| `src/components/Auth/Login.jsx` | Full-screen login form; validates against USERS; calls onLogin(user) |
| `src/components/Layout/Sidebar.jsx` | Fixed sidebar; renders getVisibleNavItems(currentUser); role badge; logout |
| `src/utils/permissions.js` | 8 pure permission helpers: canCreateTask, canEditTask, canDeleteTask, canDragTask, canApproveMeeting, canViewAnalytics, canViewTeams, getVisibleNavItems |

## Mock Data — USERS (src/data/mockData.js)
| id  | name          | email          | password   | role        | teamId |
|-----|---------------|----------------|------------|-------------|--------|
| u1  | Alex Morgan   | alex@mo.io     | admin123   | ADMIN       | team1  |
| u2  | Gege Dobruna  | gege@mo.io     | lead123    | TEAM_LEAD   | team1  |
| u3  | Sara Chen     | sara@mo.io     | lead456    | TEAM_LEAD   | team2  |
| u4  | Edda Smith    | edda@mo.io     | member123  | TEAM_MEMBER | team1  |
| u5  | Marco Rivera  | marco@mo.io    | member456  | TEAM_MEMBER | team1  |
| u6  | Priya Patel   | priya@mo.io    | member789  | TEAM_MEMBER | team2  |

## Missing Features (unchanged from before)
- Role-based permission guards on Board drag/drop and buttons (Phase 2)
- Blocker escalation timestamps (Phase 2)
- Meeting Requests page + evaluateMeetingRequest logic (Phase 3)
- Meeting Notes parser (Phase 3)
- Dashboard, My Tasks, Calendar, Teams, Analytics pages (Phase 4)
- Agenda items are fully static (hardcoded, cannot add/edit/remove)
- WIP limit is not enforced — only visual warning
- No filtering or search

## Key Modules & Responsibilities
| File | Responsibility |
|------|---------------|
| `src/App.jsx` | Root state (tasks, showAgenda, currentUser, activePage); auth gate; shell layout |
| `src/data/mockData.js` | All seed data + constants (COLUMNS, WIP_LIMIT, INITIAL_TASKS, AGENDA_ITEMS, ROLES, USERS, TEAMS, NAV_ITEMS) |
| `src/components/Board.jsx` | DragDropContext, drag logic, task CRUD handlers, modal orchestration |
| `src/components/Column.jsx` | Droppable container, WIP badge, Add button |
| `src/components/TaskCard.jsx` | Draggable card, priority styling, inline sync-request UI, hover delete |
| `src/components/AgendaPanel.jsx` | Fixed sidebar, static agenda, sync request list, smart banner |
| `src/components/AddTaskModal.jsx` | New task creation form (full task shape) |
| `src/components/TaskDetailModal.jsx` | Full task edit + delete button |
| `src/utils/storage.js` | localStorage helpers: loadFromStorage + saveToStorage |
| `src/utils/permissions.js` | Role-based permission helpers (8 functions) |
