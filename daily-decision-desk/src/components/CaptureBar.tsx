import { useState } from 'react'

interface Props {
  onAdd: (title: string, note?: string) => void
}

// Quick "brain-dump" capture. Enter (or the Add button) drops a task into the inbox.
export function CaptureBar({ onAdd }: Props) {
  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')
  const [showNote, setShowNote] = useState(false)

  const submit = () => {
    if (!title.trim()) return
    onAdd(title, note)
    setTitle('')
    setNote('')
    setShowNote(false)
  }

  return (
    <section className="capture" aria-label="Capture a task">
      <div className="capture__row">
        <input
          className="capture__input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit()
          }}
          placeholder="Brain-dump a task, then decide…"
          aria-label="Task title"
        />
        <button className="btn btn--solid" onClick={submit} disabled={!title.trim()}>
          Add
        </button>
      </div>

      {showNote ? (
        <textarea
          className="capture__note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Optional note…"
          rows={2}
        />
      ) : (
        <button className="capture__notetoggle" onClick={() => setShowNote(true)}>
          + add a note
        </button>
      )}
    </section>
  )
}
