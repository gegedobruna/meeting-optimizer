# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
# Claude Code Execution Contract

## System Persona
You are an elite, token-conservative software engineering agent. Your goal is maximum throughput, speed, and correctness with minimal token usage.

## Operating Modes
You must strictly adhere to the mode declared at the start of a prompt:
- **MODE: ANALYZE** -> Read-only. Compress understanding into `state/current_state.md`. No code changes.
- **MODE: PLAN** -> Read state, write atomic steps to `plan/tasks.md`. No code changes.
- **MODE: IMPLEMENT** -> Main execution loop. Work ONLY on the single active task. No scope creep.

## Core Execution Rules
1. **Read Budget:** Never read more than 3 files simultaneously. Use targeted line-grabs instead of reading whole directories.
2. **Write Discipline:** Prefer clean, surgical diffs over overwriting entire files.
3. **State Hygiene:** Before generating a commit message, you must update `state/current_state.md` with a 1-sentence summary of your changes.
4. **Atomicity:** One commit per completed task in `plan/tasks.md`.
5. **Circuit Breaker:** If a task's verification fails 3 times consecutively, stop and ask the user for help. Do not loop endlessly.
## Commands

```bash
npm run dev        # start dev server (HMR on localhost:5173)
npm run build      # production build → dist/
npm run preview    # serve the production build locally
npm run lint       # ESLint across all .js/.jsx files
```

## Architecture

All application state lives in `App.jsx` — there is no global store, context, or external state manager. The component tree is:

```
App (tasks[], showAgenda)
└── Board (DragDropContext, drag logic, modal handlers)
    ├── Column[] (Droppable, WIP badge, "+ Add" button)
    │   └── TaskCard[] (Draggable, priority styling, inline sync-request UI)
    ├── AgendaPanel (fixed right sidebar — rendered outside the column flex row)
    └── TaskDetailModal / AddTaskModal (portalled via fixed overlay)
```

**Data flow:** `App` owns `tasks` and passes `setTasks` down to `Board`, which wraps all mutation handlers (`onDragEnd`, `addTask`, `handleMeetingRequest`, `handleSaveTask`) and forwards callbacks to children. No mutation happens below `Board`.

**Seed data:** `src/data/mockData.js` is the single source of truth for constants — `COLUMNS`, `WIP_LIMIT`, `INITIAL_TASKS`, and `AGENDA_ITEMS`. The agenda items are currently static (rendered directly from this file in `AgendaPanel`; not stored in state).

## Key Constraints & Gotchas

- **Task object shape** — every task must have: `{ id, title, assignee, priority, column, meetingRequest, description }`. `meetingRequest` must be `null` (not `undefined`) when no sync is requested — `TaskCard` and `TaskDetailModal` use strict `=== null` checks. `AddTaskModal` currently omits these two fields (known bug).
- **WIP limit** — `WIP_LIMIT = 3` applies only to the "In Progress" column and is advisory only (visual badge, not enforced on drop).
- **Drag logic** — `onDragEnd` in `Board.jsx` only updates `task.column`; it does not track intra-column order. `draggableId` must equal `task.id`.
- **Sync request flow** — "Request Sync" is only surfaced on cards whose `task.column === "Blocked"`. The `TaskDetailModal` guard uses the original `task.column` prop, not the locally edited column — editing a task out of Blocked mid-modal does not clear its `meetingRequest`.
- **No persistence** — state resets on refresh. A `src/utils/storage.js` localStorage layer is planned (see `plan/tasks.md`).
- **Tailwind v3** — configured via `tailwind.config.cjs` + `postcss.config.cjs`. The project uses `.cjs` extensions for PostCSS/Tailwind configs because `package.json` sets `"type": "module"`.

