import { useCallback, useEffect, useState } from 'react'
import type { Task, TaskPriority, TaskStatus } from '../types'
import { supabase } from '../lib/supabase'

export type NewTaskInput = {
  title: string
  description?: string
  priority?: TaskPriority
  due_date?: string | null
  status?: TaskStatus
}

export function useTasks(userId: string | undefined) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTasks = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    setError(null)
    const { data, error: qErr } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: true })

    if (qErr) {
      setError(qErr.message)
      setTasks([])
    } else {
      setTasks((data as Task[]) ?? [])
    }
    setLoading(false)
  }, [userId])

  useEffect(() => {
    if (!userId) return
    void fetchTasks()

    const channel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${userId}` },
        () => {
          void fetchTasks()
        },
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [userId, fetchTasks])

  const createTask = useCallback(
    async (input: NewTaskInput) => {
      if (!userId) return { error: 'Not signed in' as const }
      const row = {
        title: input.title.trim(),
        status: (input.status ?? 'todo') satisfies TaskStatus,
        description: input.description?.trim() || null,
        priority: input.priority ?? 'normal',
        due_date: input.due_date || null,
      }
      const { data, error: insErr } = await supabase.from('tasks').insert(row).select().single()
      if (insErr) return { error: insErr.message }
      setTasks((prev) => [...prev, data as Task])
      return { data: data as Task }
    },
    [userId],
  )

  const updateTask = useCallback(async (id: string, patch: Partial<Task>) => {
    const { data, error: upErr } = await supabase.from('tasks').update(patch).eq('id', id).select().single()
    if (upErr) return { error: upErr.message }
    const updated = data as Task
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)))
    return { data: updated }
  }, [])

  const updateStatus = useCallback(
    async (id: string, status: TaskStatus) => {
      return updateTask(id, { status })
    },
    [updateTask],
  )

  const deleteTask = useCallback(async (id: string) => {
    const { error: delErr } = await supabase.from('tasks').delete().eq('id', id)
    if (delErr) return { error: delErr.message }
    setTasks((prev) => prev.filter((t) => t.id !== id))
    return { ok: true as const }
  }, [])

  return {
    tasks,
    loading,
    error,
    refetch: fetchTasks,
    createTask,
    updateTask,
    updateStatus,
    deleteTask,
  }
}
