import { useState } from 'react'
import { Check, Pencil, Trash2, X, Save } from 'lucide-react'

export default function TaskItem({ task, onToggle, onDelete, onEdit }) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description)

  const saveEdit = () => {
    const trimmed = title.trim()
    if (!trimmed) return
    onEdit(task.id, trimmed, description.trim())
    setEditing(false)
  }

  const cancelEdit = () => {
    setTitle(task.title)
    setDescription(task.description)
    setEditing(false)
  }

  return (
    <li className="group animate-fade-in rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl shadow-lg transition hover:border-white/20 hover:bg-white/10">
      {editing ? (
        <div className="space-y-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-fuchsia-400/60 focus:ring-2 focus:ring-fuchsia-500/30"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Description"
            className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90 outline-none focus:border-fuchsia-400/60 focus:ring-2 focus:ring-fuchsia-500/30"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={cancelEdit}
              className="flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-sm text-white/70 transition hover:bg-white/10"
            >
              <X size={15} /> Cancel
            </button>
            <button
              onClick={saveEdit}
              className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-emerald-500"
            >
              <Save size={15} /> Save
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3">
          <button
            onClick={() => onToggle(task.id)}
            className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition ${
              task.completed
                ? 'border-emerald-400 bg-emerald-500 text-white'
                : 'border-white/30 text-transparent hover:border-fuchsia-400'
            }`}
            aria-label="Toggle complete"
          >
            <Check size={14} />
          </button>

          <div className="min-w-0 flex-1">
            <p
              className={`break-words font-medium ${
                task.completed ? 'text-white/40 line-through' : 'text-white'
              }`}
            >
              {task.title}
            </p>
            {task.description && (
              <p
                className={`mt-1 break-words text-sm ${
                  task.completed ? 'text-white/25 line-through' : 'text-white/60'
                }`}
              >
                {task.description}
              </p>
            )}
          </div>

          <div className="flex shrink-0 gap-1 opacity-0 transition group-hover:opacity-100">
            <button
              onClick={() => setEditing(true)}
              className="rounded-lg p-2 text-white/60 transition hover:bg-white/10 hover:text-indigo-300"
              aria-label="Edit task"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="rounded-lg p-2 text-white/60 transition hover:bg-white/10 hover:text-rose-400"
              aria-label="Delete task"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      )}
    </li>
  )
}
