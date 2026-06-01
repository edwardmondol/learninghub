import { useCallback, useEffect, useState } from 'react'
import type { Quadrant, Task } from './types'
import { classify } from './classify'

const STORAGE_KEY = 'ddd:tasks:v1'

// Safely read the persisted task list. Any corruption/parse error falls back
// to an empty desk rather than crashing the app.
function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as Task[]) : []
  } catch {
    return []
  }
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(loadTasks)

  // Persist the full list on every change. Wrapped so a full localStorage
  // (or disabled storage) never breaks the UI.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
    } catch {
      /* storage unavailable — keep working in-memory */
    }
  }, [tasks])

  const addTask = useCallback((title: string, note?: string) => {
    const trimmed = title.trim()
    if (!trimmed) return
    const task: Task = {
      id: crypto.randomUUID(),
      title: trimmed,
      note: note?.trim() || undefined,
      quadrant: 'inbox',
      done: false,
      createdAt: Date.now(),
    }
    setTasks((prev) => [...prev, task])
  }, [])

  // Decide where an inbox task belongs based on the two yes/no answers.
  const decideTask = useCallback(
    (id: string, important: boolean, urgent: boolean) => {
      const quadrant = classify(important, urgent)
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, quadrant } : t)),
      )
    },
    [],
  )

  const moveTask = useCallback((id: string, quadrant: Quadrant) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, quadrant } : t)),
    )
  }, [])

  const toggleDone = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    )
  }, [])

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const clearCompleted = useCallback(() => {
    setTasks((prev) => prev.filter((t) => !t.done))
  }, [])

  return {
    tasks,
    addTask,
    decideTask,
    moveTask,
    toggleDone,
    deleteTask,
    clearCompleted,
  }
}
