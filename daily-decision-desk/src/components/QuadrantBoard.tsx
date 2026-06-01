import type { Task } from '../types'
import { QUADRANTS } from '../types'

interface Props {
  tasks: Task[]
  onToggleDone: (id: string) => void
  onRedecide: (id: string) => void
  onDelete: (id: string) => void
}

// The 2x2 Eisenhower board. One card per quadrant, each listing its tasks.
export function QuadrantBoard({ tasks, onToggleDone, onRedecide, onDelete }: Props) {
  return (
    <div className="board">
      {QUADRANTS.map((meta) => {
        const items = tasks.filter((t) => t.quadrant === meta.key)
        return (
          <section
            key={meta.key}
            className="quadrant"
            style={
              {
                // Expose the accent so CSS can tint headers/borders per quadrant.
                '--accent': meta.accent,
              } as React.CSSProperties
            }
          >
            <header className="quadrant__head">
              <div>
                <h3 className="quadrant__title">
                  {meta.title}
                  {meta.focus && <span className="quadrant__star" aria-label="Today's focus">★</span>}
                </h3>
                <span className="quadrant__subtitle">{meta.subtitle}</span>
              </div>
              <span className="quadrant__verb">{meta.verb}</span>
            </header>

            <ul className="quadrant__list">
              {items.length === 0 && <li className="quadrant__empty">—</li>}
              {items.map((task) => (
                <li key={task.id} className={`taskrow${task.done ? ' is-done' : ''}`}>
                  <label className="taskrow__main">
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={() => onToggleDone(task.id)}
                    />
                    <span className="taskrow__text">
                      <span className="taskrow__title">{task.title}</span>
                      {task.note && <span className="taskrow__note">{task.note}</span>}
                    </span>
                  </label>
                  <div className="taskrow__actions">
                    <button
                      className="icon-btn"
                      title="Re-decide (send back to inbox)"
                      onClick={() => onRedecide(task.id)}
                    >
                      ↺
                    </button>
                    <button
                      className="icon-btn icon-btn--danger"
                      title="Delete"
                      onClick={() => onDelete(task.id)}
                    >
                      ✕
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
