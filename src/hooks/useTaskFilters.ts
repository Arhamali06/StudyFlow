import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { TASK_PRIORITIES, TASK_SORTS, TASK_TABS, TASK_TYPES } from '../lib/constants'
import type { Subject, TaskFilterState, TaskSort } from '../types'

/**
 * Keeps the task search, filters, tab and sort in the page URL, e.g.
 * /tasks?q=quiz&subject=abc&tab=pending&sort=priority
 * This makes the header search, "View tasks" links and refreshes all work
 * with no extra state. Values missing from the URL fall back to defaults.
 */

type FilterUpdates = Partial<TaskFilterState & { sort: TaskSort }>

const PARAM_NAMES = {
  query: 'q',
  subjectId: 'subject',
  priority: 'priority',
  type: 'type',
  tab: 'tab',
  overdue: 'overdue',
  sort: 'sort',
} as const

const DEFAULT_SORT: TaskSort = 'dueDate'

/** Returns `value` if it is one of `options`, otherwise `fallback`. */
function pickOption<T extends string>(value: string | null, options: readonly T[], fallback: T): T {
  return options.find((option) => option === value) ?? fallback
}

export function useTaskFilters(subjects: Subject[]) {
  const [params, setParams] = useSearchParams()

  const filters = useMemo<TaskFilterState>(() => {
    const subjectParam = params.get(PARAM_NAMES.subjectId)
    const subjectExists = subjects.some((subject) => subject.id === subjectParam)

    return {
      query: params.get(PARAM_NAMES.query) ?? '',
      subjectId: subjectExists && subjectParam ? subjectParam : 'all',
      priority: pickOption(params.get(PARAM_NAMES.priority), [...TASK_PRIORITIES, 'all'], 'all'),
      type: pickOption(params.get(PARAM_NAMES.type), [...TASK_TYPES, 'all'], 'all'),
      tab: pickOption(params.get(PARAM_NAMES.tab), TASK_TABS, 'all'),
      overdue: params.get(PARAM_NAMES.overdue) === 'true',
    }
  }, [params, subjects])

  const sort = pickOption(params.get(PARAM_NAMES.sort), TASK_SORTS, DEFAULT_SORT)

  const updateFilters = useCallback(
    (updates: FilterUpdates) => {
      const next = new URLSearchParams(params)

      for (const [key, value] of Object.entries(updates)) {
        const name = PARAM_NAMES[key as keyof typeof PARAM_NAMES]
        const isDefault = value === '' || value === 'all' || value === DEFAULT_SORT || value === false
        if (isDefault) next.delete(name)
        else next.set(name, String(value))
      }

      setParams(next, { replace: true }) // don't fill the back button with every keystroke
    },
    [params, setParams],
  )

  // "Clear filters" clears the filters only; the chosen sort order stays.
  const resetFilters = useCallback(() => {
    const next = new URLSearchParams()
    const sortValue = params.get(PARAM_NAMES.sort)
    if (sortValue) next.set(PARAM_NAMES.sort, sortValue)
    setParams(next, { replace: true })
  }, [params, setParams])

  const hasActiveFilters =
    filters.query.trim() !== '' ||
    filters.subjectId !== 'all' ||
    filters.priority !== 'all' ||
    filters.type !== 'all' ||
    filters.tab !== 'all' ||
    filters.overdue

  return { filters, sort, updateFilters, resetFilters, hasActiveFilters }
}
