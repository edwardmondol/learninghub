import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, ListTodo } from 'lucide-react'
import Background from './components/Background.jsx'
import TaskForm from './components/TaskForm.jsx'
import TaskList from './components/TaskList.jsx'

const STORAGE_KEY = 'modern-todo-tasks'
const FILTERS = ['all', 'active', 'completed']

function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export default function App() {
  const [tasks, setTasks] = useState(loadTasks)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  }, [tasks])

  const addTask = (title, description) => {
    setTasks((prev) => [
      {
        id: crypto.randomUUID(),
        title,
        description,
        completed: false,
        createdAt: Date.now(),
      },
      ...prev,
    ])
  }

  const toggleTask = (id) =>
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    )

  const deleteTask = (id) =>
    setTasks((prev) => prev.filter((t) => t.id !== id))

  const editTask = (id, title, description) =>
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, title, description } : t)),
    )

  const filteredTasks = useMemo(() => {
    if (filter === 'active') return tasks.filter((t) => !t.completed)
    if (filter === 'completed') return tasks.filter((t) => t.completed)
    return tasks
  }, [tasks, filter])

  const remaining = tasks.filter((t) => !t.completed).length

  return (
    <>
      <Background />
      <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-4 py-10 sm:py-16">
        <header className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-white/70 backdrop-blur-xl">
            <ListTodo size={16} className="text-fuchsia-400" />
            Stay organized
          </div>
          <h1 className="bg-gradient-to-r from-white via-fuchsia-200 to-indigo-200 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl">
            My Tasks
          </h1>
          <p className="mt-2 flex items-center justify-center gap-1.5 text-sm text-white/50">
            <CheckCircle2 size={15} className="text-emerald-400" />
            {remaining} {remaining === 1 ? 'task' : 'tasks'} remaining
          </p>
        </header>

        <TaskForm onAdd={addTask} />

        <div className="mt-6 flex justify-center gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition ${
                filter === f
                  ? 'bg-white/15 text-white'
                  : 'text-white/50 hover:bg-white/5 hover:text-white/80'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <TaskList
          tasks={filteredTasks}
          onToggle={toggleTask}
          onDelete={deleteTask}
          onEdit={editTask}
        />

        <footer className="mt-auto pt-10 text-center text-xs text-white/30">
          Built with React &amp; Tailwind
        </footer>
      </div>
    </>
  )
}
