import { createContext, useCallback, useEffect, useMemo, useReducer, useRef, type ReactNode } from 'react'
import { z } from 'zod'
import { appDataReducer } from './appDataReducer'
import { DEFAULT_USER_NAME, USER_NAME_MAX_LENGTH } from '../lib/constants'
import { useToast } from '../hooks/useToast'
import { createId } from '../lib/ids'
import { createSampleData } from '../lib/sampleData'
import { isSubjectNameTaken } from '../lib/subjects'
import {
  loadSubjects,
  loadTasks,
  loadUserName,
  clearStoredAppData,
  consumeSkippedItemCount,
  STORAGE_KEYS,
  saveSubjects,
  saveTasks,
  saveUserName,
} from '../lib/storage'
import { buildNewTask, buildUpdatedTask } from '../lib/tasks'
import { subjectSchema } from '../schemas/subjectSchema'
import { taskSchema } from '../schemas/taskSchema'
import type { ActionResult, AppData, AppDataContextValue } from '../types'

// The context object lives next to its provider; hooks/ re-expose it.
// eslint-disable-next-line react-refresh/only-export-components
export const AppDataContext = createContext<AppDataContextValue | null>(null)

/* ----- Small helpers ----- */

function success<T>(data: T): ActionResult<T> {
  return { ok: true, data }
}

function failure<T = undefined>(error: string): ActionResult<T> {
  return { ok: false, error }
}

function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? 'Something is not valid.'
}

/** Reads saved data once, when the app starts. */
function loadInitialData(): AppData {
  const subjects = loadSubjects()
  return { subjects, tasks: loadTasks(subjects), userName: loadUserName() }
}

/* ----- Provider ----- */

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appDataReducer, undefined, loadInitialData)
  const { showToast } = useToast()
  const skipNextPersistence = useRef(false)
  const initialState = useRef(state)
  const saveFailed = useRef(false)
  const showToastRef = useRef(showToast)
  useEffect(() => {
    showToastRef.current = showToast
  }, [showToast])

  const warnAboutSkippedData = useCallback(() => {
    if (consumeSkippedItemCount() > 0) {
      showToastRef.current(
        'Some saved data could not be read and was skipped. A backup copy of the original was kept in this browser.',
        'error',
      )
    }
  }, [])

  // Tell the user (once) if saved data had to be skipped while the app started.
  useEffect(() => {
    warnAboutSkippedData()
  }, [warnAboutSkippedData])

  // Save to localStorage whenever a piece of data changes.
  useEffect(() => {
    if (skipNextPersistence.current) {
      skipNextPersistence.current = false
      return
    }
    // Don't rewrite storage just because the app started: if some saved data could
    // not be read, overwriting it here would destroy it before the user ever sees it.
    if (state === initialState.current) return

    const saved = [
      saveSubjects(state.subjects),
      saveTasks(state.tasks),
      saveUserName(state.userName),
    ].every(Boolean)
    if (!saved && !saveFailed.current) {
      showToastRef.current(
        'Your latest changes could not be saved in this browser. Storage may be full or blocked.',
        'error',
      )
    }
    saveFailed.current = !saved
  }, [state])

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (
        event.key !== STORAGE_KEYS.subjects &&
        event.key !== STORAGE_KEYS.tasks &&
        event.key !== STORAGE_KEYS.userName
      ) return
      const subjects = loadSubjects()
      dispatch({ type: 'data/replaced', state: { subjects, tasks: loadTasks(subjects), userName: loadUserName() } })
      warnAboutSkippedData()
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [warnAboutSkippedData])

  /*
   * Each action below: (1) checks the rules, (2) builds a complete record,
   * (3) validates it with the Zod schema, (4) dispatches it to the reducer,
   * and (5) returns an ActionResult the UI can use for toast messages.
   *
   * Note: the checks read `state` from the latest render. If two actions are
   * called in the same click handler, the second one doesn't see the first
   * one's changes yet. In this app each handler performs a single action.
   */

  const addSubject = useCallback<AppDataContextValue['addSubject']>(
    (input) => {
      const parsed = subjectSchema.safeParse({ ...input, id: createId() })
      if (!parsed.success) return failure(firstIssue(parsed.error))
      if (isSubjectNameTaken(state.subjects, parsed.data.name)) {
        return failure('You already have a subject with this name.')
      }

      dispatch({ type: 'subject/added', subject: parsed.data })
      return success(parsed.data)
    },
    [state.subjects],
  )

  const updateSubject = useCallback<AppDataContextValue['updateSubject']>(
    (id, changes) => {
      const existing = state.subjects.find((subject) => subject.id === id)
      if (!existing) return failure('That subject no longer exists.')

      const parsed = subjectSchema.safeParse({ ...existing, ...changes, id: existing.id })
      if (!parsed.success) return failure(firstIssue(parsed.error))
      if (isSubjectNameTaken(state.subjects, parsed.data.name, existing.id)) {
        return failure('You already have a subject with this name.')
      }

      dispatch({ type: 'subject/updated', subject: parsed.data })
      return success(parsed.data)
    },
    [state.subjects],
  )

  const deleteSubject = useCallback<AppDataContextValue['deleteSubject']>(
    (id, strategy) => {
      if (!state.subjects.some((subject) => subject.id === id)) {
        return failure('That subject no longer exists.')
      }

      if (strategy.mode === 'move-tasks') {
        const target = strategy.targetSubjectId
        if (target === id || !state.subjects.some((subject) => subject.id === target)) {
          return failure('Choose a different subject to move the tasks to.')
        }
      }

      const affectedTasks = state.tasks.filter((task) => task.subjectId === id).length
      dispatch({ type: 'subject/deleted', id, strategy })
      return success({ affectedTasks })
    },
    [state.subjects, state.tasks],
  )

  const addTask = useCallback<AppDataContextValue['addTask']>(
    (input) => {
      if (!state.subjects.some((subject) => subject.id === input.subjectId)) {
        return failure('Choose a subject that exists.')
      }

      const task = buildNewTask(input, createId(), new Date().toISOString())
      const parsed = taskSchema.safeParse(task)
      if (!parsed.success) return failure(firstIssue(parsed.error))

      dispatch({ type: 'task/added', task: parsed.data })
      return success(parsed.data)
    },
    [state.subjects],
  )

  const updateTask = useCallback<AppDataContextValue['updateTask']>(
    (id, changes) => {
      const existing = state.tasks.find((task) => task.id === id)
      if (!existing) return failure('That task no longer exists.')

      if (
        changes.subjectId !== undefined &&
        !state.subjects.some((subject) => subject.id === changes.subjectId)
      ) {
        return failure('Choose a subject that exists.')
      }

      const updated = buildUpdatedTask(existing, changes, new Date().toISOString())
      const parsed = taskSchema.safeParse(updated)
      if (!parsed.success) return failure(firstIssue(parsed.error))

      dispatch({ type: 'task/updated', task: parsed.data })
      return success(parsed.data)
    },
    [state.tasks, state.subjects],
  )

  const deleteTask = useCallback<AppDataContextValue['deleteTask']>(
    (id) => {
      if (!state.tasks.some((task) => task.id === id)) return failure('That task no longer exists.')

      dispatch({ type: 'task/deleted', id })
      return success(undefined)
    },
    [state.tasks],
  )

  const toggleTaskCompleted = useCallback<AppDataContextValue['toggleTaskCompleted']>(
    (id) => {
      const existing = state.tasks.find((task) => task.id === id)
      if (!existing) return failure('That task no longer exists.')

      return updateTask(id, { status: existing.status === 'completed' ? 'pending' : 'completed' })
    },
    [state.tasks, updateTask],
  )

  const setUserName = useCallback<AppDataContextValue['setUserName']>((name) => {
    const clean = name.trim().slice(0, USER_NAME_MAX_LENGTH) || DEFAULT_USER_NAME
    dispatch({ type: 'userName/set', name: clean })
  }, [])

  const loadSampleData = useCallback<AppDataContextValue['loadSampleData']>(() => {
    const alreadyLoaded =
      state.subjects.some((subject) => subject.isSample) ||
      state.tasks.some((task) => task.isSample)
    if (alreadyLoaded) return failure('Sample data is already loaded.')

    const { subjects, tasks } = createSampleData()
    dispatch({ type: 'sample/loaded', subjects, tasks })
    return success(undefined)
  }, [state.subjects, state.tasks])

  const clearAllData = useCallback(() => {
    skipNextPersistence.current = true
    const stored = clearStoredAppData()
    dispatch({ type: 'data/cleared', defaultUserName: DEFAULT_USER_NAME })
    return stored
  }, [])

  const value = useMemo<AppDataContextValue>(
    () => ({
      ...state,
      addSubject,
      updateSubject,
      deleteSubject,
      addTask,
      updateTask,
      deleteTask,
      toggleTaskCompleted,
      setUserName,
      loadSampleData,
      clearAllData,
    }),
    [
      state,
      addSubject,
      updateSubject,
      deleteSubject,
      addTask,
      updateTask,
      deleteTask,
      toggleTaskCompleted,
      setUserName,
      loadSampleData,
      clearAllData,
    ],
  )

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}
