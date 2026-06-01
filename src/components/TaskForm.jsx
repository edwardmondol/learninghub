import { useState } from 'react'
import { Plus } from 'lucide-react'

export default function TaskForm({ onAdd }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return
    onAdd(trimmed, description.trim())
    setTitle('')
    setDescription('')
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl shadow-xl"
    >
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="What needs to be done?"
        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 outline-none transition focus:border-fuchsia-400/60 focus:ring-2 focus:ring-fuchsia-500/30"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Add a description (optional)"
        rows={2}
        className="mt-3 w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/90 placeholder-white/40 outline-none transition focus:border-fuchsia-400/60 focus:ring-2 focus:ring-fuchsia-500/30"
      />
      <button
        type="submit"
        disabled={!title.trim()}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 px-4 py-3 font-semibold text-white shadow-lg transition hover:from-fuchsia-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Plus size={18} />
        Add Task
      </button>
    </form>
  )
}
