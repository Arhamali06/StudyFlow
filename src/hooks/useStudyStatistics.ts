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
    const dateRange = getProgressDateRange(today, range)
    const activityTasks = getRangeCompletedTasks(tasks, dateRange)
    const dueTasks = getDueDateTasks(tasks, dateRange)
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
      typeBreakdown: getTypeProgressBreakdown(dueTasks, activityTasks),
      priorityBreakdown: getPriorityProgressBreakdown(dueTasks, activityTasks),
      weekdayBreakdown: getProductivityByWeekday(tasks, dateRange),
      nextUp: getNextUpTask(tasks, today),
    }
  }, [range, tasks, today])
}
