import { useDroppable } from '@dnd-kit/core'
import type { Task, TaskStatus } from '../types'
import { TaskCard } from './TaskCard'

export function Column({
  id,
  title,
  hint,
  tasks,
  onOpenTask,
  onDeleteTask,
}: {
  id: TaskStatus
  title: string
  hint: string
  tasks: Task[]
  onOpenTask: (t: Task) => void
  onDeleteTask: (id: string) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <section className={`column ${isOver ? 'column--over' : ''}`}>
      <header className="column__head">
        <div>
          <h2 className="column__title">{title}</h2>
          <p className="column__hint">{hint}</p>
        </div>
        <span className="column__count">{tasks.length}</span>
      </header>
      <div ref={setNodeRef} className="column__body">
        {tasks.length === 0 ? (
          <p className="column__empty">Drop tasks here</p>
        ) : (
          tasks.map((t) => (
            <TaskCard
              key={t.id}
              task={t}
              onOpen={() => onOpenTask(t)}
              onDelete={() => onDeleteTask(t.id)}
            />
          ))
        )}
      </div>
    </section>
  )
}
