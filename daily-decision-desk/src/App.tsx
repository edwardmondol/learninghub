import { useMemo } from 'react'
import { useTasks } from './useTasks'
import { CaptureBar } from './components/CaptureBar'
import { DecisionCard } from './components/DecisionCard'
import { QuadrantBoard } from './components/QuadrantBoard'
import { QUADRANTS } from './types'

export default function App() {
  const {
    tasks,
    addTask,
    decideTask,
    moveTask,
    toggleDone,
    deleteTask,
    clearCompleted,
  } = useTasks()

  // Inbox = undecided tasks, oldest first. The decision flow surfaces the first one.
  const inbox = useMemo(
    () =>
      tasks
        .filter((t) => t.quadrant === 'inbox')
        .sort((a, b) => a.createdAt - b.createdAt),
    [tasks],
  )

  // "In focus" = tasks living in the focus quadrants (Do / Decide), not yet done.
  const focusKeys = QUADRANTS.filter((q) => q.focus).map((q) => q.key)
  const inFocus = tasks.filter(
    (t) => focusKeys.includes(t.quadrant as never) && !t.done,
  ).length
  const doneCount = tasks.filter((t) => t.done).length
  const hasCompleted = doneCount > 0

  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  const isEmpty = tasks.length === 0

  return (
    <div className="app">
      <header className="masthead">
        <div className="masthead__brand">
          <h1 className="masthead__title">Daily Decision Desk</h1>
          <p className="masthead__date">{today}</p>
        </div>
        <div className="masthead__stats">
          <div className="stat">
            <span className="stat__num">{inFocus}</span>
            <span className="stat__label">in focus</span>
          </div>
          <div className="stat">
            <span className="stat__num">{doneCount}</span>
            <span className="stat__label">done</span>
          </div>
          <button
            className="btn btn--ghost"
            onClick={clearCompleted}
            disabled={!hasCompleted}
          >
            Clear completed
          </button>
        </div>
      </header>

      <p className="creed">
        Decide once what deserves your attention, then act with intention.
      </p>

      <div className="layout">
        <div className="layout__left">
          <CaptureBar onAdd={addTask} />
          <DecisionCard
            task={inbox[0] ?? null}
            remaining={inbox.length}
            onDecide={decideTask}
          />
        </div>

        <div className="layout__right">
          {isEmpty ? (
            <div className="emptydesk">
              <p className="emptydesk__mark">⌷</p>
              <h2 className="emptydesk__title">The desk is clear.</h2>
              <p className="emptydesk__hint">
                Brain-dump whatever is on your mind, then decide where it belongs.
              </p>
            </div>
          ) : (
            <QuadrantBoard
              tasks={tasks}
              onToggleDone={toggleDone}
              onRedecide={(id) => moveTask(id, 'inbox')}
              onDelete={deleteTask}
            />
          )}
        </div>
      </div>
    </div>
  )
}
