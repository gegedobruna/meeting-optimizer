---
date: 2026-06-01
last_change: All 4 phases shipped. Identified three systemic upgrade targets: raw-string assignee field must become assignedUserIds[], AddTaskModal lacks team/capacity picker, MeetingNotes parser requires strict syntax and still emits string names.
---

## System Purpose
A React/Vite Kanban board for small teams to manage tasks across workflow stages, surface meeting-necessity signals, and optimize who attends which meetings — built with role-based access control and a smart meeting evaluator.

## Architecture Summary
- **Stack:** React 18 + Vite + Tailwind CSS + @hello-pangea/dnd
- **State:** `App.jsx` owns tasks, meetingRequests, showAgenda, currentUser, activePage; persisted to localStorage via `src/utils/storage.js`
- **Auth:** Login.jsx gates the shell; session stored as `mo_current_user` (user id) in localStorage
- **Routing:** `activePage` string in App.jsx; Sidebar nav calls `setActivePage`; no React Router
- **Permissions:** `src/utils/permissions.js` — 8 pure helpers; canEditTask/canDragTask currently match on `task.assignee === user.name` (string comparison — fragile)

## Implemented Features (all 4 phases complete)
| Feature | Status |
|---------|--------|
| 6-column Kanban + drag-and-drop | ✓ |
| WIP limit badge on "In Progress" | ✓ |
| Task cards with priority color coding | ✓ |
| Add Task modal | ✓ (free-text assignee — bug target) |
| Task Detail modal with edit + delete | ✓ (free-text assignee — bug target) |
| Task deletion (modal + hover ×) | ✓ |
| Login screen + session persistence | ✓ |
| Role-filtered Sidebar navigation | ✓ |
| Permission guards on drag, create, delete | ✓ |
| Blocker escalation (24h/48h/72h+ badges) | ✓ |
| Meeting request form + live verdict | ✓ |
| Meeting request approval workflow | ✓ |
| Meeting Notes text parser → Board tasks | ✓ (strict regex; emits string name — bug target) |
| Dashboard (role-adaptive panels) | ✓ |
| My Tasks (filtered list + modal) | ✓ |
| Calendar (monthly grid + day panel) | ✓ |
| Teams (workload heatmap) | ✓ |
| Analytics (throughput, ROI, escalation) | ✓ |

## Known Bugs / Upgrade Targets
1. **Raw-string assignee field** — `task.assignee` is a plain string (`"Gege Dobruna"`). All ownership checks in `permissions.js`, filter logic in `MyTasks`, `Dashboard`, `Teams`, and `Analytics` depend on string matching against `user.name`. A name change or typo silently breaks every permission gate and workload count.
2. **AddTaskModal free-text assignee** — No validation, no user lookup, no capacity awareness. Anyone can type any string; it will not match any real user ID.
3. **MeetingNotes parser — strict syntax & string output** — Only lines matching `- [ ]`, `* [ ]`, `TODO:`, or `Action:` are extracted. Notes without that syntax produce nothing. Extracted items are added to the board with `assignee: user.name` (string), bypassing the planned ID schema.
4. **USERS lacks `title` and `department`** — The user entity has no job title or department field; TaskCard and TaskDetailModal cannot display rich identity information.

## Key Modules & Responsibilities
| File | Responsibility |
|------|---------------|
| `src/App.jsx` | Root state; auth gate; shared addTask/saveTask/deleteTask; renderPage switch |
| `src/data/mockData.js` | All seed data: COLUMNS, WIP_LIMIT, INITIAL_TASKS (assignee string — to migrate), AGENDA_ITEMS, ROLES, USERS (no title/dept — to extend), TEAMS, NAV_ITEMS |
| `src/components/Board.jsx` | DragDropContext, canDragTask guard, blockedSince stamping, drag toast |
| `src/components/Column.jsx` | Droppable, WIP badge, canCreateTask-gated Add button |
| `src/components/TaskCard.jsx` | Draggable, escalation border/badge, fromMeeting badge, hover delete |
| `src/components/AgendaPanel.jsx` | Static agenda + sync request list |
| `src/components/AddTaskModal.jsx` | New task form — free-text assignee (upgrade target) |
| `src/components/TaskDetailModal.jsx` | Full task edit, read-only mode, dueDate field |
| `src/components/Auth/Login.jsx` | Login form, USERS credential check |
| `src/components/Layout/Sidebar.jsx` | Nav, user card, role badge, logout |
| `src/utils/permissions.js` | 8 role helpers — ownership checks use task.assignee string (upgrade target) |
| `src/utils/meetingRules.js` | evaluateMeetingRequest(), MEETING_REQUEST_STATUSES |
| `src/utils/storage.js` | loadFromStorage / saveToStorage |
| `src/pages/Dashboard.jsx` | Role-adaptive metrics; team workload uses task.assignee string (upgrade target) |
| `src/pages/MyTasks.jsx` | Filtered personal task list; matches on task.assignee string (upgrade target) |
| `src/pages/MeetingNotes.jsx` | Text parser → Board tasks; strict regex; emits assignee string (upgrade target) |
| `src/pages/MeetingRequests.jsx` | Request form + approver table |
| `src/pages/Calendar.jsx` | Monthly grid, dueDate + scheduledDate dots |
| `src/pages/Teams.jsx` | Team workload heatmap; matches on task.assignee string (upgrade target) |
| `src/pages/Analytics.jsx` | Throughput, meeting ROI, blocker breakdown; matches on task.assignee string (upgrade target) |
