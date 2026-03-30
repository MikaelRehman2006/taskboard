export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done'

export type TaskPriority = 'low' | 'normal' | 'high'

export interface Task {
  id: string
  title: string
  status: TaskStatus
  user_id: string
  created_at: string
  description: string | null
  priority: TaskPriority | null
  due_date: string | null
  assignee_id: string | null
}

export const COLUMNS: { id: TaskStatus; title: string; hint: string }[] = [
  { id: 'todo', title: 'To Do', hint: 'New work' },
  { id: 'in_progress', title: 'In Progress', hint: 'Active' },
  { id: 'in_review', title: 'In Review', hint: 'Needs eyes' },
  { id: 'done', title: 'Done', hint: 'Shipped' },
]

export function isTaskStatus(v: string): v is TaskStatus {
  return ['todo', 'in_progress', 'in_review', 'done'].includes(v)
}
