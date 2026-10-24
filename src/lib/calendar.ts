import { addDays, compareDateStrings, parseDateString, toDateString } from './dates'
import { isTaskOverdue } from './tasks'
import type { Subject, Task } from '../types'

/** Calendar months use JavaScript's 0-based convention: January is 0, December is 11. */
export interface CalendarDay {
  date: string
  year: number
  month: number
  day: number
  isCurrentMonth: boolean
}

export interface CalendarMonth {
  year: number
  month: number
  days: CalendarDay[]
}

export interface DaySummary {
  tasks: Task[]
  overdue: number
}

export type CalendarNavigationKey =
  | 'ArrowLeft'
  | 'ArrowRight'
  | 'ArrowUp'
  | 'ArrowDown'
  | 'Home'
  | 'End'
  | 'PageUp'
  | 'PageDown'

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const

export function getMonthGrid(selectedDate: string): CalendarMonth {
  const parsed = parseDateString(selectedDate)
  if (!parsed) return { year: 1970, month: 0, days: [] }

  const year = parsed.getFullYear()
  const month = parsed.getMonth()
  const firstDay = new Date(year, month, 1)
  const gridStart = addDays(firstDay, -firstDay.getDay())
  const days = Array.from({ length: 42 }, (_, index) => {
    const date = addDays(gridStart, index)
    return {
      date: toDateString(date),
      year: date.getFullYear(),
      month: date.getMonth(),
      day: date.getDate(),
      isCurrentMonth: date.getMonth() === month && date.getFullYear() === year,
    }
  })

  return { year, month, days }
}

export function clampDateToMonth(year: number, month: number, day: number): string {
  const lastDay = new Date(year, month + 1, 0).getDate()
  return toDateString(new Date(year, month, Math.min(day, lastDay)))
}

export function shiftMonth(dateString: string, offset: number): string {
  const date = parseDateString(dateString)
  if (!date) return dateString
  const targetMonth = date.getMonth() + offset
  return clampDateToMonth(date.getFullYear(), targetMonth, date.getDate())
}

export function moveCalendarDate(
  dateString: string,
  key: CalendarNavigationKey,
  shiftKey = false,
): string {
  if (key === 'PageUp') return shiftMonth(dateString, shiftKey ? -12 : -1)
  if (key === 'PageDown') return shiftMonth(dateString, shiftKey ? 12 : 1)

  const date = parseDateString(dateString)
  if (!date) return dateString
  if (key === 'Home') return toDateString(addDays(date, -date.getDay()))
  if (key === 'End') return toDateString(addDays(date, 6 - date.getDay()))

  const offset =
    key === 'ArrowLeft' ? -1 : key === 'ArrowRight' ? 1 : key === 'ArrowUp' ? -7 : 7
  return toDateString(addDays(date, offset))
}

export function groupTasksByDate(tasks: Task[]): Map<string, Task[]> {
  const grouped = new Map<string, Task[]>()
  for (const task of tasks) {
    grouped.set(task.dueDate, [...(grouped.get(task.dueDate) ?? []), task])
  }
  return grouped
}

export function getDaySummary(tasks: Task[], date: string, today: string): DaySummary {
  const dayTasks = tasks.filter((task) => task.dueDate === date)
  return {
    tasks: dayTasks,
    overdue: dayTasks.filter((task) => isTaskOverdue(task, today)).length,
  }
}

export function formatCalendarMonth(year: number, month: number): string {
  return `${MONTH_NAMES[month]} ${year}`
}

export function formatCalendarDay(date: string): string {
  const parsed = parseDateString(date)
  return parsed
    ? parsed.toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : date
}

export function getCalendarDayLabel(date: string, tasks: Task[], today: string): string {
  const parsed = parseDateString(date)
  if (!parsed) return date
  const summary = getDaySummary(tasks, date, today)
  const todayLabel = date === today ? ' (today)' : ''
  if (summary.tasks.length === 0) {
    return `${parsed.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })}${todayLabel}. No tasks`
  }
  return `${parsed.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })}${todayLabel}. ${summary.tasks.length} ${
    summary.tasks.length === 1 ? 'task' : 'tasks'
  }${summary.overdue ? `, ${summary.overdue} overdue` : ''}`
}

export function getMonthTaskCount(tasks: Task[], year: number, month: number): number {
  return tasks.filter((task) => {
    const date = parseDateString(task.dueDate)
    return date?.getFullYear() === year && date.getMonth() === month
  }).length
}

export function sortDayTasks(tasks: Task[]): Task[] {
  const priorityRank = { high: 3, medium: 2, low: 1 } as const
  return [...tasks].sort(
    (a, b) =>
      Number(b.status === 'pending') - Number(a.status === 'pending') ||
      priorityRank[b.priority] - priorityRank[a.priority] ||
      a.title.localeCompare(b.title),
  )
}

export function getTaskIndicatorSubjects(tasks: Task[], subjects: Map<string, Subject>): Subject[] {
  return tasks.slice(0, 3).map((task) => subjects.get(task.subjectId)).filter((subject): subject is Subject => Boolean(subject))
}

export function compareCalendarDates(a: string, b: string): number {
  return compareDateStrings(a, b)
}
