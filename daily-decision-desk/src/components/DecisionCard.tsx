import { useState } from 'react'
import type { Task } from '../types'

interface Props {
  task: Task | null // the first unsorted inbox task, if any
  remaining: number // how many tasks are still in the inbox
  onDecide: (id: string, important: boolean, urgent: boolean) => void
}

// The heart of the product: a guided, one-at-a-time decision flow.
// Asks "Important?" then "Urgent?", then classifies the task.
export function DecisionCard({ task, remaining, onDecide }: Props) {
  // Holds the first answer (Important?) until the second answer arrives.
  const [important, setImportant] = useState<boolean | null>(null)

  if (!task) {
    return (
      <section className="decision decision--empty">
        <p className="decision__zero">Inbox clear.</p>
        <p className="decision__hint">Every task has earned its place. Capture the next one above.</p>
      </section>
    )
  }

  const step = important === null ? 1 : 2

  const answer = (value: boolean) => {
    if (important === null) {
      setImportant(value)
      return
    }
    // Second answer (urgent) — classify and advance to the next task.
    onDecide(task.id, important, value)
    setImportant(null)
  }

  return (
    <section className="decision" aria-label="Decide on the next task">
      <div className="decision__meta">
        <span className="decision__label">Deciding</span>
        <span className="decision__count">{remaining} in inbox</span>
      </div>

      <h2 className="decision__title">{task.title}</h2>
      {task.note && <p className="decision__note">{task.note}</p>}

      <div className="decision__question">
        <span className="decision__step">Step {step} of 2</span>
        <p className="decision__ask">{step === 1 ? 'Is it important?' : 'Is it urgent?'}</p>
      </div>

      <div className="decision__actions">
        <button className="btn btn--yes" onClick={() => answer(true)}>
          Yes
        </button>
        <button className="btn btn--no" onClick={() => answer(false)}>
          No
        </button>
      </div>

      {important !== null && (
        <button className="decision__back" onClick={() => setImportant(null)}>
          ← back to importance
        </button>
      )}
    </section>
  )
}
