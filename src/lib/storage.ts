import { DEFAULT_THEME, DEFAULT_USER_NAME, THEME_PREFERENCES, USER_NAME_MAX_LENGTH } from './constants'
import { normalizeStoredTask } from './tasks'
import { subjectSchema } from '../schemas/subjectSchema'
import { taskSchema } from '../schemas/taskSchema'
import type { Subject, Task, ThemePreference } from '../types'

/**
 * Safe localStorage helpers.
 *
 * Rules this file follows:
 *  - It never throws. Private mode, a full disk, blocked storage, broken JSON
 *    or hand-edited values all fall back to empty/default data.
 *  - Everything read is validated with the Zod schemas. Invalid records are
 *    dropped instead of crashing the app.
 *  - Keys are versioned ("v1"). If the data shape ever changes, a future
 *    version can read the old keys and migrate them.
 */

const KEY_PREFIX = 'studyflow:v1:'

export const STORAGE_KEYS = {
  subjects: `${KEY_PREFIX}subjects`,
  tasks: `${KEY_PREFIX}tasks`,
  userName: `${KEY_PREFIX}userName`,
  theme: `${KEY_PREFIX}theme`,
} as const

/* ----- Low-level helpers ----- */

function getStorage(): Storage | null {
  try {
    return window.localStorage
  } catch {
    return null // blocked by browser settings
  }
}

/** Returns the parsed JSON value, or undefined if missing, unreadable or invalid JSON. */
function readJSON(key: string): unknown {
  try {
    const raw = getStorage()?.getItem(key)
    return raw == null ? undefined : JSON.parse(raw)
  } catch {
    return undefined
  }
}

/** Returns true if the value was saved. Fails quietly (storage full or blocked). */
function writeJSON(key: string, value: unknown): boolean {
  try {
    const storage = getStorage()
    if (!storage) return false
    storage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

function removeKey(key: string): boolean {
  try {
    const storage = getStorage()
    if (!storage) return false
    storage.removeItem(key)
    return true
  } catch {
    return false
  }
}

/* ----- Subjects ----- */

export function loadSubjects(): Subject[] {
  const raw = readJSON(STORAGE_KEYS.subjects)
  if (!Array.isArray(raw)) return []

  const seenIds = new Set<string>()
  const subjects: Subject[] = []

  for (const item of raw) {
    const result = subjectSchema.safeParse(item)
    if (!result.success || seenIds.has(result.data.id)) continue
    seenIds.add(result.data.id)
    subjects.push(result.data)
  }

  return subjects
}

export function saveSubjects(subjects: Subject[]): boolean {
  return writeJSON(STORAGE_KEYS.subjects, subjects)
}

/* ----- Tasks ----- */

/**
 * Loads tasks. Pass in the already-loaded subjects so tasks pointing to a
 * subject that no longer exists are dropped (a task must never reference a
 * missing subject).
 */
export function loadTasks(subjects: Subject[]): Task[] {
  const raw = readJSON(STORAGE_KEYS.tasks)
  if (!Array.isArray(raw)) return []

  const subjectIds = new Set(subjects.map((subject) => subject.id))
  const seenIds = new Set<string>()
  const tasks: Task[] = []

  for (const item of raw) {
    const result = taskSchema.safeParse(item)
    if (!result.success) continue
    if (seenIds.has(result.data.id) || !subjectIds.has(result.data.subjectId)) continue
    seenIds.add(result.data.id)
    tasks.push(normalizeStoredTask(result.data))
  }

  return tasks
}

export function saveTasks(tasks: Task[]): boolean {
  return writeJSON(STORAGE_KEYS.tasks, tasks)
}

/* ----- User name ----- */

export function loadUserName(): string {
  const raw = readJSON(STORAGE_KEYS.userName)
  if (typeof raw !== 'string') return DEFAULT_USER_NAME
  return raw.trim().slice(0, USER_NAME_MAX_LENGTH) || DEFAULT_USER_NAME
}

export function saveUserName(name: string): boolean {
  return writeJSON(STORAGE_KEYS.userName, name)
}

/* ----- Theme ----- */

export function loadTheme(): ThemePreference {
  const raw = readJSON(STORAGE_KEYS.theme)
  const isValid = THEME_PREFERENCES.some((theme) => theme === raw)
  return isValid ? (raw as ThemePreference) : DEFAULT_THEME
}

export function saveTheme(theme: ThemePreference): boolean {
  return writeJSON(STORAGE_KEYS.theme, theme)
}

/* ----- Reset ----- */

/** Removes saved tasks, subjects and name. The theme preference is kept on purpose. */
export function clearStoredAppData(): boolean {
  return [STORAGE_KEYS.subjects, STORAGE_KEYS.tasks, STORAGE_KEYS.userName]
    .map(removeKey)
    .every(Boolean)
}
