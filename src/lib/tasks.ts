import { compareDateStrings, formatDate, getDayDifference, getTodayString } from './dates'
import type {
  Task,
  TaskChanges,
  TaskFilterState,
  TaskInput,
  TaskPriority,
  TaskSort,
  TaskTab,
} from '../types'

/**
 * Keeps `status` and `completedAt` consistent:
 *  - completed tasks always have a completion time,
 *  - pending tasks never do.
 * A task that was already completed keeps its original completion time.
 */
function resolveCompletion(task: Task, previous: Task | undefined, now: string): Task {
  if (task.status === 'pending') {
    return { ...task, completedAt: null }
  }
  const keepOldTime = previous?.status === 'completed' && previous.completedAt
  return { ...task, completedAt: keepOldTime ? previous.completedAt : now }
}

/** Builds a complete Task from form input. `id` and `now` are passed in to keep this function pure. */
export function buildNewTask(input: TaskInput, id: string, now: string): Task {
  return resolveCompletion({ ...input, id, createdAt: now, completedAt: null }, undefined, now)
}

/** Applies changes to an existing task and fixes up the completion time. */
export function buildUpdatedTask(previous: Task, changes: TaskChanges, now: string): Task {
  return resolveCompletion({ ...previous, ...changes }, previous, now)
}

/**
 * Repairs a task read from storage whose status and completion time disagree
 * (for example, if someone edited localStorage by hand).
 */
export function normalizeStoredTask(task: Task): Task {
  if (task.status === 'pending') {
    return task.completedAt === null ? task : { ...task, completedAt: null }
  }
  return task.completedAt ? task : { ...task, completedAt: task.createdAt }
}

/* ==========================================================================
   Phase 4 — overdue check, filtering, sorting and due-date wording
   ========================================================================== */

const PRIORITY_RANK: Record<TaskPriority, number> = { high: 3, medium: 2, low: 1 }

/** A task is overdue when it is still pending and its due date is before today. */
export function isTaskOverdue(task: Task, today: string): boolean {
  return task.status === 'pending' && compareDateStrings(task.dueDate, today) < 0
}

/** Applies search + filters + tab. Returns a new array. */
export function filterTasks(tasks: Task[], filters: TaskFilterState): Task[] {
  const query = filters.query.trim().toLowerCase()

  return tasks.filter((task) => {
    if (query && !task.title.toLowerCase().includes(query)) return false
    if (filters.subjectId !== 'all' && task.subjectId !== filters.subjectId) return false
    if (filters.priority !== 'all' && task.priority !== filters.priority) return false
    if (filters.type !== 'all' && task.type !== filters.type) return false
    if (filters.tab !== 'all' && task.status !== filters.tab) return false
    if (filters.overdue && !isTaskOverdue(task, getTodayString())) return false
    return true
  })
}

/** How many tasks each tab would show, given the other filters. */
export function countTasksByTab(tasks: Task[], filters: TaskFilterState): Record<TaskTab, number> {
  const matching = filterTasks(tasks, { ...filters, tab: 'all' })
  const completed = matching.filter((task) => task.status === 'completed').length
  return { all: matching.length, pending: matching.length - completed, completed }
}

/** Returns a sorted copy. Ties are broken so the order is always predictable. */
export function sortTasks(tasks: Task[], sort: TaskSort): Task[] {
  const byTitle = (a: Task, b: Task) => a.title.localeCompare(b.title)
  const byDueDate = (a: Task, b: Task) => compareDateStrings(a.dueDate, b.dueDate)
  const byPriority = (a: Task, b: Task) => PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority]

  return [...tasks].sort((a, b) => {
    switch (sort) {
      case 'priority':
        return byPriority(a, b) || byDueDate(a, b) || byTitle(a, b)
      case 'createdAt':
        return b.createdAt.localeCompare(a.createdAt) || byTitle(a, b)
      case 'dueDate':
        return byDueDate(a, b) || byPriority(a, b) || byTitle(a, b)
    }
  })
}

export interface DueInfo {
  label: string
  isOverdue: boolean
}

/** Friendly due-date text such as "Due tomorrow" or "Overdue by 3 days". */
export function getDueInfo(task: Task, today: string): DueInfo {
  const isOverdue = isTaskOverdue(task, today)
  const daysUntilDue = getDayDifference(today, task.dueDate)

  if (isOverdue) {
    const days = Math.abs(daysUntilDue)
    return { label: `Overdue by ${days} ${days === 1 ? 'day' : 'days'}`, isOverdue }
  }
  if (task.status === 'pending' && daysUntilDue === 0) return { label: 'Due today', isOverdue }
  if (task.status === 'pending' && daysUntilDue === 1) return { label: 'Due tomorrow', isOverdue }
  return { label: `Due ${formatDate(task.dueDate)}`, isOverdue }
}
