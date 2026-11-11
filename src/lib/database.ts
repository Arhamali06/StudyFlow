import { z } from 'zod'
import { subjectSchema } from '../schemas/subjectSchema'
import { taskSchema } from '../schemas/taskSchema'
import type { Tables } from '../types/database'
import type { Subject, Task } from '../types'

const profileSchema = z.object({
  full_name: z.string().trim().min(1).max(40),
})

export function mapSubject(row: Tables<'subjects'>): Subject {
  const parsed = subjectSchema.safeParse({ id: row.id, name: row.name, color: row.color })
  if (!parsed.success) throw new Error(`Invalid subject returned by database: ${parsed.error.issues[0]?.message}`)
  return parsed.data
}

export function mapTask(row: Tables<'tasks'>): Task {
  const parsed = taskSchema.safeParse({
    id: row.id,
    title: row.title,
    description: row.description,
    subjectId: row.subject_id,
    type: row.type,
    dueDate: row.due_date,
    priority: row.priority,
    status: row.status,
    createdAt: row.created_at,
    completedAt: row.completed_at,
  })
  if (!parsed.success) throw new Error(`Invalid task returned by database: ${parsed.error.issues[0]?.message}`)
  return parsed.data
}

export function mapProfile(row: Tables<'profiles'>): string {
  const parsed = profileSchema.safeParse(row)
  if (!parsed.success) throw new Error(`Invalid profile returned by database: ${parsed.error.issues[0]?.message}`)
  return parsed.data.full_name
}
