# Daily Decision Desk

A calm, offline-first daily to-do manager built on the **Eisenhower Matrix**. Capture tasks, decide *once* whether each is important and/or urgent, and watch them land in the right quadrant. Built with Vite + React + TypeScript, plain CSS, and `localStorage` persistence — no backend, no auth.

## The model
Every task answers two yes/no questions:

| Important | Urgent | Quadrant | Action |
|-----------|--------|----------|--------|
| yes | yes | **Do** | Act now |
| yes | no  | **Decide** | Schedule it |
| no  | yes | **Delegate** | Hand it off |
| no  | no  | **Delete** | Let it go |

## Features
- **Capture bar** — brain-dump tasks (Enter to add) with an optional note; new tasks land in the Inbox.
- **Guided decision flow** — surfaces the first inbox task, asks Important? then Urgent?, then classifies it.
- **2x2 matrix board** — one card per quadrant with action verb + tasks.
- **Per-task actions** — complete, re-decide (back to inbox), delete.
- **Daily focus** — Do & Decide are starred; header shows "in focus" and "done" counts + today's date.
- **Clear completed** — remove all done tasks in one click.
- **Empty state** — a calm prompt when the desk is clear.
- **Persistence** — full task list saved to `localStorage` (`ddd:tasks:v1`).

## Getting started

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (usually http://localhost:5173).

## Build

```bash
npm run build
npm run preview
```

## File tree
```
daily-decision-desk/
├─ index.html
├─ package.json
├─ tsconfig.json
├─ tsconfig.node.json
├─ vite.config.ts
└─ src/
   ├─ main.tsx              # React entry
   ├─ App.tsx               # composition, focus header, clear/empty states
   ├─ index.css             # paper & ink design system
   ├─ types.ts              # Task, Quadrant, quadrant metadata
   ├─ classify.ts           # pure Eisenhower classifier
   ├─ useTasks.ts           # state + localStorage hook
   └─ components/
      ├─ CaptureBar.tsx
      ├─ DecisionCard.tsx
      └─ QuadrantBoard.tsx
```

## Optional next features
1. **Drag-between-quadrants** — re-classify by dragging a task card to another quadrant.
2. **Daily carry-over** — on a new day, automatically roll unfinished Do/Decide focus tasks forward (with a "carried over" badge).
3. **Keyboard shortcuts** — `I`/`U` to answer the decision card, `n` to focus the capture input, `⌫` to delete the hovered task.
