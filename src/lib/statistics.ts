import {
  addDays,
  compareDateStrings,
  isValidTimestamp,
  parseDateString,
  toDateString,
} from './dates'
import type { Task } from '../types'

/**
 * Statistics are always calculated from the real tasks — nothing here is
 * stored. Later phases (dashboard, progress) add more functions to this file.
 */

/** Whole-number percentage from 0 to 100 (0 when there is nothing to measure). */
export function calculatePercentage(part: number, total: number): number {
  if (total <= 0) return 0
  return Math.round((part / total) * 100)
}

export interface SubjectProgress {
  total: number
  completed: number
  pending: number
  /** 0–100 */
  percent: number
}

const EMPTY_PROGRESS: SubjectProgress = { total: 0, completed: 0, pending: 0, percent: 0 }

/** Counts every subject's tasks in one pass. Subjects with no tasks are simply missing from the map. */
export function getSubjectProgressMap(tasks: Task[]): Map<string, SubjectProgress> {
  const counts = new Map<string, { total: number; completed: number }>()

  for (const task of tasks) {
    const entry = counts.get(task.subjectId) ?? { total: 0, completed: 0 }
    entry.total += 1
    if (task.status === 'completed') entry.completed += 1
    counts.set(task.subjectId, entry)
  }

  const result = new Map<string, SubjectProgress>()
  for (const [subjectId, { total, completed }] of counts) {
    result.set(subjectId, {
      total,
      completed,
      pending: total - completed,
      percent: calculatePercentage(completed, total),
    })
  }
  return result
}

export function getProgressForSubject(
  map: Map<string, SubjectProgress>,
  subjectId: string,
): SubjectProgress {
  return map.get(subjectId) ?? EMPTY_PROGRESS
}

/* ==========================================================================
   Phase 5 — dashboard statistics
   ========================================================================== */

/** Counts tasks by status and identifies overdue ones. */
export interface TaskCounts {
  total: number
  pending: number
  completed: number
  overdue: number
}

export function getTaskCounts(tasks: Task[], today: string): TaskCounts {
  let pending = 0
  let completed = 0
  let overdue = 0

  for (const task of tasks) {
    if (task.status === 'completed') {
      completed += 1
    } else {
      pending += 1
      if (compareDateStrings(task.dueDate, today) < 0) {
        overdue += 1
      }
    }
  }

  return { total: tasks.length, pending, completed, overdue }
}

/** The 7 day-strings (YYYY-MM-DD) for the Sun\u2013Sat week containing `today`. */
export function getWeekDays(today: string): string[] {
  const date = parseDateString(today)
  if (!date) return []

  const sunday = addDays(date, -date.getDay())
  const days: string[] = []
  for (let i = 0; i < 7; i++) {
    days.push(toDateString(addDays(sunday, i)))
  }
  return days
}

/** How many tasks were completed on each day of a given week. */
export interface DayCompletion {
  /** "YYYY-MM-DD" */
  day: string
  /** Single-character label such as "S", "M", "T". */
  dayLabel: string
  /** Full label such as "Sunday", "Monday". */
  fullDayLabel: string
  count: number
  isToday: boolean
}

const SHORT_DAY = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const
const FULL_DAY = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const

/**
 * Counts completed tasks per day for a given week.
 * Only tasks with status "completed" and a valid completedAt are counted.
 */
export function getCompletionsPerDay(
  tasks: Task[],
  weekDays: string[],
  today: string,
): DayCompletion[] {
  const counts = new Map<string, number>()
  for (const task of tasks) {
    if (
      task.status !== 'completed' ||
      !task.completedAt ||
      !isValidTimestamp(task.completedAt)
    ) {
      continue
    }
    const localDate = toDateString(new Date(task.completedAt))
    counts.set(localDate, (counts.get(localDate) ?? 0) + 1)
  }

  return weekDays.map((day, i) => ({
    day,
    dayLabel: SHORT_DAY[i],
    fullDayLabel: FULL_DAY[i],
    count: counts.get(day) ?? 0,
    isToday: day === today,
  }))
}

/** Total completed tasks whose completedAt falls on one of the given days. */
export function countCompletionsInDays(tasks: Task[], days: string[]): number {
  const daySet = new Set(days)
  let total = 0
  for (const task of tasks) {
    if (
      task.status !== 'completed' ||
      !task.completedAt ||
      !isValidTimestamp(task.completedAt)
    ) {
      continue
    }
    if (daySet.has(toDateString(new Date(task.completedAt)))) total += 1
  }
  return total
}

/**
 * Percentage change from the previous week to the current week.
 * Returns null when the previous week had zero completions (no divide-by-zero).
 */
export function getWeeklyChangePercent(
  currentCount: number,
  previousCount: number,
): number | null {
  if (previousCount <= 0) return null
  return Math.round(((currentCount - previousCount) / previousCount) * 100)
}

/** Pending tasks due today or earlier, sorted oldest-first. */
export function getTodayAndOverdueTasks(tasks: Task[], today: string): Task[] {
  return tasks
    .filter(
      (task) =>
        task.status === 'pending' && compareDateStrings(task.dueDate, today) <= 0,
    )
    .sort((a, b) => compareDateStrings(a.dueDate, b.dueDate))
}

/** Pending tasks due after today, sorted nearest-first. */
export function getUpcomingTasks(tasks: Task[], today: string): Task[] {
  return tasks
    .filter(
      (task) =>
        task.status === 'pending' && compareDateStrings(task.dueDate, today) > 0,
    )
    .sort((a, b) => compareDateStrings(a.dueDate, b.dueDate))
}

export interface OverallProgress {
  total: number
  completed: number
  percent: number
}

export function getOverallProgress(tasks: Task[]): OverallProgress {
  const completed = tasks.filter((task) => task.status === 'completed').length
  return { total: tasks.length, completed, percent: calculatePercentage(completed, tasks.length) }
}

export interface DetailedSubjectProgress extends SubjectProgress {
  overdue: number
}

export function getDetailedSubjectProgressMap(
  tasks: Task[],
  today: string,
): Map<string, DetailedSubjectProgress> {
  const result = new Map<string, DetailedSubjectProgress>()
  for (const task of tasks) {
    const current = result.get(task.subjectId) ?? {
      total: 0,
      completed: 0,
      pending: 0,
      percent: 0,
      overdue: 0,
    }
    current.total += 1
    if (task.status === 'completed') current.completed += 1
    else {
      current.pending += 1
      if (compareDateStrings(task.dueDate, today) < 0) current.overdue += 1
    }
    current.percent = calculatePercentage(current.completed, current.total)
    result.set(task.subjectId, current)
  }
  return result
}

export interface WeeklySummary {
  days: DayCompletion[]
  total: number
  previousTotal: number
  changePercent: number | null
}

export function getWeeklySummary(tasks: Task[], today: string): WeeklySummary {
  const days = getWeekDays(today)
  const previousDate = parseDateString(today)
  const previousWeekDays = previousDate
    ? getWeekDays(toDateString(addDays(previousDate, -7)))
    : []
  const currentDays = getCompletionsPerDay(tasks, days, today)
  const total = countCompletionsInDays(tasks, days)
  const previousTotal = countCompletionsInDays(tasks, previousWeekDays)
  return {
    days: currentDays,
    total,
    previousTotal,
    changePercent: getWeeklyChangePercent(total, previousTotal),
  }
}

export interface WeeklyTrendPoint {
  weekStart: string
  label: string
  count: number
}

export function getWeeklyTrend(
  tasks: Task[],
  today: string,
  weeks = 8,
): WeeklyTrendPoint[] {
  const date = parseDateString(today)
  if (!date || weeks <= 0) return []
  const currentSunday = getWeekDays(today)[0]
  const currentSundayDate = parseDateString(currentSunday)
  if (!currentSundayDate) return []

  return Array.from({ length: weeks }, (_, index) => {
    const weekStartDate = addDays(currentSundayDate, (index - weeks + 1) * 7)
    const weekStart = toDateString(weekStartDate)
    const days = getWeekDays(weekStart)
    return {
      weekStart,
      label: weekStartDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      count: countCompletionsInDays(tasks, days),
    }
  })
}
