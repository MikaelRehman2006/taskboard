import type { Task, TaskPriority } from '../types'

export function Header({
  search,
  onSearchChange,
  priorityFilter,
  onPriorityFilter,
  stats,
  onNewTask,
}: {
  search: string
  onSearchChange: (v: string) => void
  priorityFilter: TaskPriority | 'all'
  onPriorityFilter: (v: TaskPriority | 'all') => void
  stats: { total: number; done: number; overdue: number }
  onNewTask: () => void
}) {
  return (
    <header className="app-header">
      <div className="app-header__brand">
        <div className="logo-mark" aria-hidden />
        <div>
          <h1 className="app-header__title">Flowboard</h1>
          <p className="app-header__tagline">Kanban for focused teams</p>
        </div>
      </div>

      <div className="app-header__stats" aria-label="Board summary">
        <div className="stat">
          <span className="stat__value">{stats.total}</span>
          <span className="stat__label">Total</span>
        </div>
        <div className="stat">
          <span className="stat__value">{stats.done}</span>
          <span className="stat__label">Done</span>
        </div>
        <div className="stat stat--alert">
          <span className="stat__value">{stats.overdue}</span>
          <span className="stat__label">Overdue</span>
        </div>
      </div>

      <div className="app-header__tools">
        <input
          type="search"
          className="search-input"
          placeholder="Search by title…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search tasks"
        />
        <select
          className="filter-select"
          value={priorityFilter}
          onChange={(e) => onPriorityFilter(e.target.value as TaskPriority | 'all')}
          aria-label="Filter by priority"
        >
          <option value="all">All priorities</option>
          <option value="low">Low</option>
          <option value="normal">Normal</option>
          <option value="high">High</option>
        </select>
        <button type="button" className="btn-primary" onClick={onNewTask}>
          New task
        </button>
      </div>
    </header>
  )
}

function isOverdue(due: string | null): boolean {
  if (!due) return false
  const d = new Date(due + 'T12:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return d.getTime() < today.getTime()
}

export function computeStats(tasks: Task[]) {
  const total = tasks.length
  const done = tasks.filter((t) => t.status === 'done').length
  const overdue = tasks.filter((t) => t.status !== 'done' && isOverdue(t.due_date)).length
  return { total, done, overdue }
}
