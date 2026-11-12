import type {
  TASK_PRIORITIES,
  TASK_SORTS,
  TASK_STATUSES,
  TASK_TABS,
  TASK_TYPES,
  THEME_PREFERENCES,
} from '../lib/constants'

/* ----- Core records (what we store) ----- */

export type TaskType = (typeof TASK_TYPES)[number]
export type TaskPriority = (typeof TASK_PRIORITIES)[number]
export type TaskStatus = (typeof TASK_STATUSES)[number]

export interface Subject {
  id: string
  name: string
  /** Hex color such as "#7b61f5". */
  color: string
}

export interface Task {
  id: string
  title: string
  description: string
  /** Always the id of an existing Subject. */
  subjectId: string
  type: TaskType
  /** Plain calendar date, "YYYY-MM-DD" (no time, no timezone). */
  dueDate: string
  priority: TaskPriority
  status: TaskStatus
  /** ISO timestamp of when the task was created. */
  createdAt: string
  /** ISO timestamp of when it was completed, or null while pending. */
  completedAt: string | null
}

/* ----- What forms and callers send in ----- */

export type SubjectInput = Pick<Subject, 'name' | 'color'>
export type SubjectChanges = Partial<SubjectInput>

export type TaskInput = Pick<
  Task,
  'title' | 'description' | 'subjectId' | 'type' | 'dueDate' | 'priority' | 'status'
>
export type TaskChanges = Partial<TaskInput>

/** What should happen to a subject's tasks when the subject is deleted. */
export type SubjectDeletionStrategy =
  | { mode: 'delete-tasks' }
  | { mode: 'move-tasks'; targetSubjectId: string }

/* ----- Task list controls (search, filters, sorting) ----- */

export type TaskTab = (typeof TASK_TABS)[number]
export type TaskSort = (typeof TASK_SORTS)[number]

export interface TaskFilterState {
  /** Text searched for in task titles. */
  query: string
  /** A subject id, or "all". */
  subjectId: string
  priority: TaskPriority | 'all'
  type: TaskType | 'all'
  tab: TaskTab
  overdue: boolean
}

/* ----- Shared app state ----- */

export interface AppData {
  subjects: Subject[]
  tasks: Task[]
  userName: string
}

/** Every data action returns this, so the UI can show a message on failure. */
export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string }

export type AsyncActionResult<T = undefined> = Promise<ActionResult<T>>

export interface AppDataContextValue extends AppData {
  loading: boolean
  error: string | null
  isInitialLoading: boolean
  isRefreshing: boolean
  dataError: string | null
  hasLoadedData: boolean
  retry: () => void
  addSubject: (input: SubjectInput) => AsyncActionResult<Subject>
  updateSubject: (id: string, changes: SubjectChanges) => AsyncActionResult<Subject>
  /** `data.affectedTasks` is how many tasks were deleted or moved. */
  deleteSubject: (
    id: string,
    strategy: SubjectDeletionStrategy,
  ) => AsyncActionResult<{ affectedTasks: number }>

  addTask: (input: TaskInput) => AsyncActionResult<Task>
  updateTask: (id: string, changes: TaskChanges) => AsyncActionResult<Task>
  deleteTask: (id: string) => AsyncActionResult
  toggleTaskCompleted: (id: string) => AsyncActionResult<Task>

  setUserName: (name: string) => AsyncActionResult<string>
  clearAllData: () => AsyncActionResult
}

/* ----- Theme ----- */

export type ThemePreference = (typeof THEME_PREFERENCES)[number]
export type ResolvedTheme = 'light' | 'dark'

export interface ThemeContextValue {
  /** What the user chose: light, dark or follow the system. */
  theme: ThemePreference
  /** What is actually applied right now (never "system"). */
  resolvedTheme: ResolvedTheme
  setTheme: (theme: ThemePreference) => void
}
