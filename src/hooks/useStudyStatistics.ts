import { useMemo } from 'react'
import { useToday } from './useToday'
import {
  getBestCompletionWeek,
  getDueDateTasks,
  getOnTimeCompletionRate,
  getNextUpTask,
  getOverallProgress,
  getProductivityByWeekday,
  getDetailedSubjectProgressMap,
  getPriorityProgressBreakdown,
  getProgressDateRange,
  getProgressDueRange,
  getRangeCompletedTasks,
  getStreakSummary,
  getTaskCounts,
  getWeeklySummary,
  getWeeklyTrend,
  getTypeProgressBreakdown,
  type ProgressRange,
} from '../lib/statistics'
import type { Task } from '../types'

export function useStudyStatistics(tasks: Task[], range: ProgressRange = 'all') {
  const today = useToday()
  return useMemo(() => {
    // Activity figures (on-time rate, weekday, best week) look at WHEN things were
    // completed, up to today. Due-date figures (ring, subjects, type/priority) look at
    // tasks due from the start of the window onwards, so upcoming work still counts.
    const dateRange = getProgressDateRange(today, range)
    const activityTasks = getRangeCompletedTasks(tasks, dateRange)
    const dueTasks = getDueDateTasks(tasks, getProgressDueRange(today, range))
    return {
      today,
      counts: getTaskCounts(tasks, today),
      overall: getOverallProgress(dueTasks),
      subjectProgress: getDetailedSubjectProgressMap(dueTasks, today),
      weekly: getWeeklySummary(tasks, today),
      trend: getWeeklyTrend(tasks, today),
      activityTasks,
      dueTasks,
      onTimeRate: getOnTimeCompletionRate(tasks, dateRange),
      streaks: getStreakSummary(tasks, today),
      bestWeek: getBestCompletionWeek(activityTasks),
      typeBreakdown: getTypeProgressBreakdown(dueTasks),
      priorityBreakdown: getPriorityProgressBreakdown(dueTasks),
      weekdayBreakdown: getProductivityByWeekday(tasks, dateRange),
      nextUp: getNextUpTask(tasks, today),
    }
  }, [range, tasks, today])
}
