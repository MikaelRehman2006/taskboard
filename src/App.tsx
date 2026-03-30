import { useMemo, useState } from 'react'
import type { Task, TaskPriority } from './types'
import { Board } from './components/Board'
import { computeStats, Header } from './components/Header'
import { TaskFormModal } from './components/TaskFormModal'
import { useGuestAuth } from './hooks/useGuestAuth'
import { useTasks } from './hooks/useTasks'
import { isSupabaseConfigured } from './lib/supabase'

export default function App() {
  const { user, loading: authLoading, error: authError } = useGuestAuth()
  const {
    tasks,
    loading: tasksLoading,
    error: tasksError,
    createTask,
    updateTask,
    deleteTask,
    updateStatus,
    refetch,
  } = useTasks(user?.id)

  const [search, setSearch] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all')
  const [modal, setModal] = useState<{ mode: 'create' | 'edit'; task: Task | null } | null>(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return tasks.filter((t) => {
      if (q && !t.title.toLowerCase().includes(q)) return false
      if (priorityFilter !== 'all' && (t.priority ?? 'normal') !== priorityFilter) return false
      return true
    })
  }, [tasks, search, priorityFilter])

  const stats = useMemo(() => computeStats(tasks), [tasks])

  const hasConfig = isSupabaseConfigured()

  if (!hasConfig) {
    return (
      <div className="shell">
        <div className="banner banner--warn">
          <h2>Configure Supabase</h2>
          <p>
            Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> (anon key only). Locally:
            copy <code>.env.example</code> to <code>.env</code>. On Vercel: Project Settings → Environment
            Variables for all environments, then <strong>Redeploy</strong> (Vite bakes these in at build time).
          </p>
          <p>
            In Supabase: enable <strong>Anonymous</strong> sign-in under Authentication → Providers, and run{' '}
            <code>supabase/schema.sql</code>.
          </p>
        </div>
      </div>
    )
  }

  if (authLoading) {
    return (
      <div className="shell shell--center">
        <div className="spinner" aria-busy="true" />
        <p className="muted">Starting your session…</p>
      </div>
    )
  }

  if (authError) {
    return (
      <div className="shell">
        <div className="banner banner--error">
          <h2>Session error</h2>
          <p>{authError}</p>
          <button type="button" className="btn-primary" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="shell">
      <Header
        search={search}
        onSearchChange={setSearch}
        priorityFilter={priorityFilter}
        onPriorityFilter={setPriorityFilter}
        stats={stats}
        onNewTask={() => setModal({ mode: 'create', task: null })}
      />

      {tasksError ? (
        <div className="banner banner--error banner--inline">
          <p>{tasksError}</p>
          <button type="button" className="btn-secondary" onClick={() => void refetch()}>
            Retry load
          </button>
        </div>
      ) : null}

      {tasks.length > 0 && filtered.length === 0 ? (
        <div className="filter-empty" role="status">
          <p>No tasks match your search or priority filter.</p>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setSearch('')
              setPriorityFilter('all')
            }}
          >
            Clear filters
          </button>
        </div>
      ) : null}

      {tasks.length === 0 && !tasksLoading ? (
        <div className="welcome-strip" role="region" aria-label="Getting started">
          <p className="welcome-strip__text">
            <strong>Welcome.</strong> Create your first task or drag cards between columns once you add work.
          </p>
        </div>
      ) : null}

      {tasksLoading && tasks.length === 0 ? (
        <div className="board-loading">
          <div className="spinner" />
          <p className="muted">Loading your board…</p>
        </div>
      ) : (
        <Board
          tasks={filtered}
          onStatusChange={(id, status) => {
            void updateStatus(id, status)
          }}
          onOpenTask={(t) => setModal({ mode: 'edit', task: t })}
          onDeleteTask={(id) => {
            void deleteTask(id)
          }}
        />
      )}

      <TaskFormModal
        open={modal !== null}
        mode={modal?.mode ?? 'create'}
        initial={modal?.task ?? null}
        onClose={() => setModal(null)}
        onSave={async (values) => {
          if (modal?.mode === 'create') {
            const r = await createTask({
              title: values.title,
              description: values.description,
              priority: values.priority,
              due_date: values.due_date,
              status: values.status,
            })
            if (r.error) throw new Error(r.error)
          } else if (modal?.task) {
            const r = await updateTask(modal.task.id, {
              title: values.title,
              description: values.description || null,
              priority: values.priority,
              due_date: values.due_date,
              status: values.status,
            })
            if (r.error) throw new Error(r.error)
          }
        }}
      />
    </div>
  )
}
