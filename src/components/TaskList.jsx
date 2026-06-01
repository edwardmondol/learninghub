import { ClipboardList } from 'lucide-react'
import TaskItem from './TaskItem.jsx'

export default function TaskList({ tasks, onToggle, onDelete, onEdit }) {
  if (tasks.length === 0) {
    return (
      <div className="mt-10 flex flex-col items-center gap-3 text-center text-white/50">
        <ClipboardList size={48} className="text-white/30" />
        <p className="text-lg font-medium">No tasks here yet</p>
        <p className="text-sm">Add your first task to get started.</p>
      </div>
    )
  }

  return (
    <ul className="mt-4 space-y-3">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </ul>
  )
}
