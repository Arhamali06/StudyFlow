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
  /** True only for items created by "Load sample data". */
  isSample?: boolean
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
  /** True only for items created by "Load sample data". */
  isSample?: boolean
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

export interface AppDataContextValue extends AppData {
  addSubject: (input: SubjectInput) => ActionResult<Subject>
  updateSubject: (id: string, changes: SubjectChanges) => ActionResult<Subject>
  /** `data.affectedTasks` is how many tasks were deleted or moved. */
  deleteSubject: (
    id: string,
    strategy: SubjectDeletionStrategy,
  ) => ActionResult<{ affectedTasks: number }>

  addTask: (input: TaskInput) => ActionResult<Task>
  updateTask: (id: string, changes: TaskChanges) => ActionResult<Task>
  deleteTask: (id: string) => ActionResult
  toggleTaskCompleted: (id: string) => ActionResult<Task>

  setUserName: (name: string) => void
  /** Adds clearly-marked sample subjects and tasks. Never runs automatically. */
  loadSampleData: () => ActionResult
  /** Deletes all tasks, subjects and the saved name. The theme is kept. */
  clearAllData: () => void
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
