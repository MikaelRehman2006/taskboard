import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { useMemo, useState } from 'react'
import type { Task, TaskStatus } from '../types'
import { COLUMNS, isTaskStatus } from '../types'
import { Column } from './Column'
import { TaskCardOverlay } from './TaskCard'

export function Board({
  tasks,
  onStatusChange,
  onOpenTask,
  onDeleteTask,
}: {
  tasks: Task[]
  onStatusChange: (taskId: string, status: TaskStatus) => void
  onOpenTask: (t: Task) => void
  onDeleteTask: (id: string) => void
}) {
  const [active, setActive] = useState<Task | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 180, tolerance: 6 },
    }),
  )

  const byStatus = useMemo(() => {
    const m: Record<TaskStatus, Task[]> = {
      todo: [],
      in_progress: [],
      in_review: [],
      done: [],
    }
    for (const t of tasks) {
      m[t.status].push(t)
    }
    return m
  }, [tasks])

  function onDragStart(e: DragStartEvent) {
    const id = String(e.active.id)
    const task = tasks.find((t) => t.id === id)
    setActive(task ?? null)
  }

  function onDragEnd(e: DragEndEvent) {
    setActive(null)
    const { active: a, over } = e
    if (!over) return
    const taskId = String(a.id)
    const overId = String(over.id)
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return

    let next: TaskStatus | null = null
    if (isTaskStatus(overId)) {
      next = overId
    } else {
      const overTask = tasks.find((t) => t.id === overId)
      if (overTask) next = overTask.status
    }
    if (next && next !== task.status) {
      onStatusChange(taskId, next)
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={() => setActive(null)}
    >
      <div className="board-wrap">
        <div className="board">
        {COLUMNS.map((col) => (
          <Column
            key={col.id}
            id={col.id}
            title={col.title}
            hint={col.hint}
            tasks={byStatus[col.id]}
            onOpenTask={onOpenTask}
            onDeleteTask={onDeleteTask}
          />
        ))}
        </div>
      </div>
      <DragOverlay dropAnimation={{ duration: 200, easing: 'ease' }}>
        {active ? <TaskCardOverlay task={active} /> : null}
      </DragOverlay>
    </DndContext>
  )
}
