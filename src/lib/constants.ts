/**
 * Fixed lists and limits used across the app.
 * The `as const` arrays are the single source of truth: the TypeScript types
 * (types/index.ts) and the Zod schemas (schemas/*.ts) are both built from them,
 * so a value can never exist in one place and be missing in another.
 */

export const TASK_TYPES = ['assignment', 'quiz', 'exam', 'revision', 'other'] as const
export const TASK_PRIORITIES = ['low', 'medium', 'high'] as const
export const TASK_STATUSES = ['pending', 'completed'] as const
export const THEME_PREFERENCES = ['light', 'dark', 'system'] as const
export const TASK_TABS = ['all', 'pending', 'completed'] as const
export const TASK_SORTS = ['dueDate', 'priority', 'createdAt'] as const

/** Human-friendly labels for the UI. */
export const TASK_TYPE_LABELS: Record<(typeof TASK_TYPES)[number], string> = {
  assignment: 'Assignment',
  quiz: 'Quiz',
  exam: 'Exam',
  revision: 'Revision',
  other: 'Other',
}

export const TASK_PRIORITY_LABELS: Record<(typeof TASK_PRIORITIES)[number], string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}

export const TASK_STATUS_LABELS: Record<(typeof TASK_STATUSES)[number], string> = {
  pending: 'Pending',
  completed: 'Completed',
}

export const TASK_TAB_LABELS: Record<(typeof TASK_TABS)[number], string> = {
  all: 'All',
  pending: 'Pending',
  completed: 'Completed',
}

export const TASK_SORT_LABELS: Record<(typeof TASK_SORTS)[number], string> = {
  dueDate: 'Due date',
  priority: 'Priority',
  createdAt: 'Recently added',
}

/** Colors a student can choose for a subject. */
export const SUBJECT_COLORS = [
  { name: 'Purple', value: '#7b61f5' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Teal', value: '#14a3a3' },
  { name: 'Green', value: '#22a06b' },
  { name: 'Yellow', value: '#d9a406' },
  { name: 'Orange', value: '#ff9500' },
  { name: 'Red', value: '#e5484d' },
  { name: 'Pink', value: '#e0559a' },
] as const

export const DEFAULT_SUBJECT_COLOR = SUBJECT_COLORS[0].value

/** Text length limits (also used for form validation in later phases). */
export const TASK_TITLE_MAX_LENGTH = 100
export const TASK_DESCRIPTION_MAX_LENGTH = 500
export const SUBJECT_NAME_MAX_LENGTH = 40
export const USER_NAME_MAX_LENGTH = 40

export const DEFAULT_USER_NAME = 'Student'
export const DEFAULT_THEME = 'system' as const
