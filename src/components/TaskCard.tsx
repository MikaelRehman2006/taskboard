import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import type { Task } from '../types'

type DueUrgency = 'overdue' | 'soon' | 'none'

function dueUrgency(due: string | null): DueUrgency {
  if (!due) return 'none'
  const d = new Date(due + 'T12:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = (d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  if (diff < 0) return 'overdue'
  if (diff <= 3) return 'soon'
  return 'none'
}

const priorityDot: Record<string, string> = {
  low: 'var(--prio-low)',
  normal: 'var(--prio-normal)',
  high: 'var(--prio-high)',
}

export function TaskCardOverlay({ task }: { task: Task }) {
  return (
    <article className="task-card task-card--overlay">
      <TaskCardInner task={task} showActions={false} />
    </article>
  )
}

function TaskCardInner({
  task,
  showActions,
  onOpen,
  onDelete,
}: {
  task: Task
  showActions: boolean
  onOpen?: () => void
  onDelete?: () => void
}) {
  const urgency = dueUrgency(task.due_date)
  const prio = task.priority ?? 'normal'

  return (
    <>
      <button type="button" className="task-card__surface" onClick={onOpen}>
        <div className="task-card__top">
          <span
            className="task-card__priority"
            style={{ background: priorityDot[prio] ?? priorityDot.normal }}
            title={`Priority: ${prio}`}
            aria-hidden
          />
          <h3 className="task-card__title">{task.title}</h3>
        </div>
        {task.description ? <p className="task-card__desc">{task.description}</p> : null}
        <div className="task-card__meta">
          {task.due_date ? (
            <span className={`task-card__due task-card__due--${urgency}`}>
              {urgency === 'overdue' ? 'Overdue · ' : urgency === 'soon' ? 'Due soon · ' : ''}
              {new Date(task.due_date + 'T12:00:00').toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          ) : (
            <span className="task-card__due task-card__due--none">No date</span>
          )}
        </div>
      </button>
      {showActions && onOpen && onDelete ? (
        <div className="task-card__actions">
          <button type="button" className="btn-ghost btn-ghost--sm" onClick={onOpen}>
            Edit
          </button>
          <button
            type="button"
            className="btn-ghost btn-ghost--sm btn-ghost--danger"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
          >
            Delete
          </button>
        </div>
      ) : null}
    </>
  )
}

export function TaskCard({
  task,
  onOpen,
  onDelete,
}: {
  task: Task
  onOpen: () => void
  onDelete: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { task },
  })

  const style = transform ? { transform: CSS.Translate.toString(transform) } : undefined

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`task-card ${isDragging ? 'task-card--dragging' : ''}`}
      {...listeners}
      {...attributes}
    >
      <TaskCardInner task={task} showActions onOpen={onOpen} onDelete={onDelete} />
    </article>
  )
}
