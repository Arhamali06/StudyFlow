import { createContext, useCallback, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react'
import { z } from 'zod'
import { appDataReducer } from './appDataReducer'
import { DEFAULT_USER_NAME, USER_NAME_MAX_LENGTH } from '../lib/constants'
import { useAuth } from './authContext'
import { useToast } from '../hooks/useToast'
import { createId } from '../lib/ids'
import { isSubjectNameTaken } from '../lib/subjects'
import { buildNewTask, buildUpdatedTask } from '../lib/tasks'
import { subjectSchema } from '../schemas/subjectSchema'
import { taskSchema } from '../schemas/taskSchema'
import { mapProfile, mapSubject, mapTask } from '../lib/database'
import { supabase } from '../utils/supabase'
import type { ActionResult, AppData, AppDataContextValue } from '../types'

// eslint-disable-next-line react-refresh/only-export-components
export const AppDataContext = createContext<AppDataContextValue | null>(null)

function success<T>(data: T): ActionResult<T> {
  return { ok: true, data }
}

function failure<T = undefined>(error: string): ActionResult<T> {
  return { ok: false, error }
}

function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? 'Something is not valid.'
}

function databaseError(error: { message: string }): string {
  if (error.message.includes('subjects_user_name_unique')) return 'You already have a subject with this name.'
  return error.message
}

const emptyState: AppData = { subjects: [], tasks: [], userName: DEFAULT_USER_NAME }

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appDataReducer, emptyState)
  const [isInitialLoading, setIsInitialLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [dataError, setDataError] = useState<string | null>(null)
  const [hasLoadedData, setHasLoadedData] = useState(false)
  const { user, loading: authLoading } = useAuth()
  const { showToast } = useToast()
  const requestId = useRef(0)
  const activeUserId = useRef<string | null>(null)
  const requestUserId = useRef<string | null>(null)
  const showToastRef = useRef(showToast)

  useEffect(() => {
    showToastRef.current = showToast
  }, [showToast])

  const fetchData = useCallback(async (targetUser: NonNullable<typeof user>, background: boolean) => {
    const currentRequest = ++requestId.current
    requestUserId.current = targetUser.id
    if (background) setIsRefreshing(true)
    else setIsInitialLoading(true)
    setDataError(null)

    try {
      const [profileResult, subjectsResult, tasksResult] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', targetUser.id).maybeSingle(),
        supabase.from('subjects').select('*').eq('user_id', targetUser.id).order('name'),
        supabase.from('tasks').select('*').eq('user_id', targetUser.id).order('due_date'),
      ])
      if (currentRequest !== requestId.current || activeUserId.current !== targetUser.id) return
      const requestError = profileResult.error ?? subjectsResult.error ?? tasksResult.error
      if (requestError) throw requestError
      const subjects = (subjectsResult.data ?? []).map(mapSubject)
      const subjectIds = new Set(subjects.map((subject) => subject.id))
      const tasks = (tasksResult.data ?? []).map(mapTask).filter((task) => subjectIds.has(task.subjectId))
      const userName = profileResult.data ? mapProfile(profileResult.data) : DEFAULT_USER_NAME
      dispatch({ type: 'data/replaced', state: { subjects, tasks, userName } })
      setHasLoadedData(true)
    } catch (requestError: unknown) {
      if (currentRequest !== requestId.current || activeUserId.current !== targetUser.id) return
      const message = requestError instanceof Error ? requestError.message : 'Unable to load your study data.'
      setDataError(message)
      showToastRef.current(message, 'error')
    } finally {
      if (currentRequest === requestId.current && activeUserId.current === targetUser.id) {
        setIsInitialLoading(false)
        setIsRefreshing(false)
        requestUserId.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (authLoading) return
    const nextUserId = user?.id ?? null
    if (activeUserId.current !== nextUserId) {
      activeUserId.current = nextUserId
      requestId.current += 1
      requestUserId.current = null
      dispatch({ type: 'data/replaced', state: emptyState })
      setHasLoadedData(false)
      setIsInitialLoading(Boolean(user))
      setIsRefreshing(false)
      setDataError(null)
    }
    if (!user || requestUserId.current === user.id || hasLoadedData) return
    void fetchData(user, false)
  }, [authLoading, fetchData, hasLoadedData, user])

  const retry = useCallback(() => {
    if (!user || requestUserId.current === user.id) return
    void fetchData(user, hasLoadedData)
  }, [fetchData, hasLoadedData, user])

  const addSubject = useCallback<AppDataContextValue['addSubject']>(async (input) => {
    if (!user) return failure('You must be signed in to add a subject.')
    const parsed = subjectSchema.safeParse({ ...input, id: createId() })
    if (!parsed.success) return failure(firstIssue(parsed.error))
    if (isSubjectNameTaken(state.subjects, parsed.data.name)) return failure('You already have a subject with this name.')
    const { data, error: requestError } = await supabase.from('subjects').insert({
      id: parsed.data.id, user_id: user.id, name: parsed.data.name, color: parsed.data.color,
    }).select().single()
    if (requestError) return failure(databaseError(requestError))
    try {
      const subject = mapSubject(data)
      dispatch({ type: 'subject/added', subject })
      return success(subject)
    } catch (mappingError) {
      return failure(mappingError instanceof Error ? mappingError.message : 'The saved subject was invalid.')
    }
  }, [state.subjects, user])

  const updateSubject = useCallback<AppDataContextValue['updateSubject']>(async (id, changes) => {
    if (!user) return failure('You must be signed in to update a subject.')
    const existing = state.subjects.find((subject) => subject.id === id)
    if (!existing) return failure('That subject no longer exists.')
    const parsed = subjectSchema.safeParse({ ...existing, ...changes, id })
    if (!parsed.success) return failure(firstIssue(parsed.error))
    if (isSubjectNameTaken(state.subjects, parsed.data.name, id)) return failure('You already have a subject with this name.')
    const { data, error: requestError } = await supabase.from('subjects').update({
      name: parsed.data.name, color: parsed.data.color,
    }).eq('id', id).eq('user_id', user.id).select().single()
    if (requestError) return failure(databaseError(requestError))
    try {
      const subject = mapSubject(data)
      dispatch({ type: 'subject/updated', subject })
      return success(subject)
    } catch (mappingError) {
      return failure(mappingError instanceof Error ? mappingError.message : 'The saved subject was invalid.')
    }
  }, [state.subjects, user])

  const deleteSubject = useCallback<AppDataContextValue['deleteSubject']>(async (id, strategy) => {
    if (!user) return failure('You must be signed in to delete a subject.')
    if (!state.subjects.some((subject) => subject.id === id)) return failure('That subject no longer exists.')
    const moveTo = strategy.mode === 'move-tasks' ? strategy.targetSubjectId : null
    if (moveTo === id || (moveTo && !state.subjects.some((subject) => subject.id === moveTo))) {
      return failure('Choose a different subject to move the tasks to.')
    }
    const affectedTasks = state.tasks.filter((task) => task.subjectId === id).length
    const { error: requestError } = await supabase.rpc('delete_subject', { p_subject_id: id, p_move_to: moveTo ?? undefined })
    if (requestError) return failure(databaseError(requestError))
    dispatch({ type: 'subject/deleted', id, strategy })
    return success({ affectedTasks })
  }, [state.subjects, state.tasks, user])

  const addTask = useCallback<AppDataContextValue['addTask']>(async (input) => {
    if (!user) return failure('You must be signed in to add a task.')
    if (!state.subjects.some((subject) => subject.id === input.subjectId)) return failure('Choose a subject that exists.')
    const parsed = taskSchema.safeParse(buildNewTask(input, createId(), new Date().toISOString()))
    if (!parsed.success) return failure(firstIssue(parsed.error))
    const { data, error: requestError } = await supabase.from('tasks').insert({
      id: parsed.data.id, user_id: user.id, title: parsed.data.title, description: parsed.data.description,
      subject_id: parsed.data.subjectId, type: parsed.data.type, due_date: parsed.data.dueDate,
      priority: parsed.data.priority, status: parsed.data.status, created_at: parsed.data.createdAt,
      completed_at: parsed.data.completedAt,
    }).select().single()
    if (requestError) return failure(databaseError(requestError))
    try {
      const task = mapTask(data)
      dispatch({ type: 'task/added', task })
      return success(task)
    } catch (mappingError) {
      return failure(mappingError instanceof Error ? mappingError.message : 'The saved task was invalid.')
    }
  }, [state.subjects, user])

  const updateTask = useCallback<AppDataContextValue['updateTask']>(async (id, changes) => {
    if (!user) return failure('You must be signed in to update a task.')
    const existing = state.tasks.find((task) => task.id === id)
    if (!existing) return failure('That task no longer exists.')
    if (changes.subjectId !== undefined && !state.subjects.some((subject) => subject.id === changes.subjectId)) {
      return failure('Choose a subject that exists.')
    }
    const parsed = taskSchema.safeParse(buildUpdatedTask(existing, changes, new Date().toISOString()))
    if (!parsed.success) return failure(firstIssue(parsed.error))
    const { data, error: requestError } = await supabase.from('tasks').update({
      title: parsed.data.title, description: parsed.data.description, subject_id: parsed.data.subjectId,
      type: parsed.data.type, due_date: parsed.data.dueDate, priority: parsed.data.priority,
      status: parsed.data.status, completed_at: parsed.data.completedAt,
    }).eq('id', id).eq('user_id', user.id).select().single()
    if (requestError) return failure(databaseError(requestError))
    try {
      const task = mapTask(data)
      dispatch({ type: 'task/updated', task })
      return success(task)
    } catch (mappingError) {
      return failure(mappingError instanceof Error ? mappingError.message : 'The saved task was invalid.')
    }
  }, [state.tasks, state.subjects, user])

  const deleteTask = useCallback<AppDataContextValue['deleteTask']>(async (id) => {
    if (!user) return failure('You must be signed in to delete a task.')
    if (!state.tasks.some((task) => task.id === id)) return failure('That task no longer exists.')
    const { error: requestError } = await supabase.from('tasks').delete().eq('id', id).eq('user_id', user.id)
    if (requestError) return failure(databaseError(requestError))
    dispatch({ type: 'task/deleted', id })
    return success(undefined)
  }, [state.tasks, user])

  const toggleTaskCompleted = useCallback<AppDataContextValue['toggleTaskCompleted']>(async (id) => {
    const existing = state.tasks.find((task) => task.id === id)
    if (!existing) return failure('That task no longer exists.')
    return updateTask(id, { status: existing.status === 'completed' ? 'pending' : 'completed' })
  }, [state.tasks, updateTask])

  const setUserName = useCallback<AppDataContextValue['setUserName']>(async (name) => {
    if (!user) return failure('You must be signed in to update your profile.')
    const clean = name.trim().slice(0, USER_NAME_MAX_LENGTH) || DEFAULT_USER_NAME
    const { data, error: requestError } = await supabase.from('profiles').update({ full_name: clean }).eq('id', user.id).select().single()
    if (requestError) return failure(databaseError(requestError))
    try {
      const userName = mapProfile(data)
      dispatch({ type: 'userName/set', name: userName })
      return success(userName)
    } catch (mappingError) {
      return failure(mappingError instanceof Error ? mappingError.message : 'The saved profile was invalid.')
    }
  }, [user])

  const clearAllData = useCallback<AppDataContextValue['clearAllData']>(async () => {
    if (!user) return failure('You must be signed in to clear your data.')
    const { error: requestError } = await supabase.rpc('clear_my_data')
    if (requestError) return failure(databaseError(requestError))
    dispatch({ type: 'data/cleared', defaultUserName: DEFAULT_USER_NAME })
    return success(undefined)
  }, [user])

  const value = useMemo<AppDataContextValue>(() => ({
    ...state, loading: isInitialLoading, error: dataError, isInitialLoading, isRefreshing, dataError,
    hasLoadedData, retry,
    addSubject, updateSubject, deleteSubject, addTask, updateTask,
    deleteTask, toggleTaskCompleted, setUserName, clearAllData,
  }), [state, isInitialLoading, isRefreshing, dataError, retry, addSubject, updateSubject,
    hasLoadedData, deleteSubject, addTask, updateTask, deleteTask, toggleTaskCompleted, setUserName, clearAllData])

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}
