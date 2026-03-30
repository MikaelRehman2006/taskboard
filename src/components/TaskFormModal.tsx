import { useEffect, useState } from 'react'
import type { Task, TaskPriority, TaskStatus } from '../types'
import { COLUMNS } from '../types'

export function TaskFormModal({
  open,
  mode,
  initial,
  onClose,
  onSave,
}: {
  open: boolean
  mode: 'create' | 'edit'
  initial: Task | null
  onClose: () => void
  onSave: (values: {
    title: string
    description: string
    priority: TaskPriority
    due_date: string | null
    status: TaskStatus
  }) => Promise<void>
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('normal')
  const [due, setDue] = useState('')
  const [status, setStatus] = useState<TaskStatus>('todo')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setFormError(null)
    if (mode === 'edit' && initial) {
      setTitle(initial.title)
      setDescription(initial.description ?? '')
      setPriority(initial.priority ?? 'normal')
      setDue(initial.due_date ?? '')
      setStatus(initial.status)
    } else {
      setTitle('')
      setDescription('')
      setPriority('normal')
      setDue('')
      setStatus('todo')
    }
  }, [open, mode, initial])

  if (!open) return null

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) {
      setFormError('Title is required')
      return
    }
    setSaving(true)
    setFormError(null)
    try {
      await onSave({
        title: title.trim(),
        description: description.trim(),
        priority,
        due_date: due || null,
        status,
      })
      onClose()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal__head">
          <h2 id="task-modal-title">{mode === 'create' ? 'New task' : 'Edit task'}</h2>
          <button type="button" className="btn-icon" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <form className="modal__form" onSubmit={submit}>
          <label className="field">
            <span>Title</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs doing?"
              autoFocus
            />
          </label>
          <label className="field">
            <span>Description</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional context…"
              rows={3}
            />
          </label>
          <div className="field-row">
            <label className="field">
              <span>Priority</span>
              <select value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)}>
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </select>
            </label>
            <label className="field">
              <span>Due date</span>
              <input type="date" value={due} onChange={(e) => setDue(e.target.value)} />
            </label>
          </div>
          {mode === 'edit' ? (
            <label className="field">
              <span>Column</span>
              <select value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)}>
                {COLUMNS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          {formError ? <p className="form-error">{formError}</p> : null}
          <div className="modal__actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving…' : mode === 'create' ? 'Create' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
