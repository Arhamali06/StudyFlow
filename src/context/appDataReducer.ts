import type { AppData, Subject, SubjectDeletionStrategy, Task } from '../types'

/**
 * The reducer is a plain function: (current state, action) -> new state.
 * It does no validation, id creation or timestamps — the context does that
 * first and sends the finished, validated records here. As a safety net the
 * reducer still refuses anything that would break the "task always points to
 * an existing subject" rule.
 */

export type AppDataAction =
  | { type: 'subject/added'; subject: Subject }
  | { type: 'subject/updated'; subject: Subject }
  | { type: 'subject/deleted'; id: string; strategy: SubjectDeletionStrategy }
  | { type: 'task/added'; task: Task }
  | { type: 'task/updated'; task: Task }
  | { type: 'task/deleted'; id: string }
  | { type: 'userName/set'; name: string }
  | { type: 'sample/loaded'; subjects: Subject[]; tasks: Task[] }
  | { type: 'data/cleared'; defaultUserName: string }
  | { type: 'data/replaced'; state: AppData }

export function appDataReducer(state: AppData, action: AppDataAction): AppData {
  switch (action.type) {
    case 'subject/added':
      return { ...state, subjects: [...state.subjects, action.subject] }

    case 'subject/updated':
      return {
        ...state,
        subjects: state.subjects.map((subject) =>
          subject.id === action.subject.id ? action.subject : subject,
        ),
      }

    case 'subject/deleted': {
      const { id, strategy } = action
      if (!state.subjects.some((subject) => subject.id === id)) return state

      const subjects = state.subjects.filter((subject) => subject.id !== id)

      if (strategy.mode === 'delete-tasks') {
        return { ...state, subjects, tasks: state.tasks.filter((task) => task.subjectId !== id) }
      }

      const { targetSubjectId } = strategy
      const targetExists = subjects.some((subject) => subject.id === targetSubjectId)
      if (!targetExists) return state // never leave tasks without a subject

      return {
        ...state,
        subjects,
        tasks: state.tasks.map((task) =>
          task.subjectId === id ? { ...task, subjectId: targetSubjectId } : task,
        ),
      }
    }

    case 'task/added': {
      const subjectExists = state.subjects.some((subject) => subject.id === action.task.subjectId)
      return subjectExists ? { ...state, tasks: [...state.tasks, action.task] } : state
    }

    case 'task/updated': {
      const subjectExists = state.subjects.some((subject) => subject.id === action.task.subjectId)
      if (!subjectExists) return state
      return {
        ...state,
        tasks: state.tasks.map((task) => (task.id === action.task.id ? action.task : task)),
      }
    }

    case 'task/deleted':
      return { ...state, tasks: state.tasks.filter((task) => task.id !== action.id) }

    case 'userName/set':
      return { ...state, userName: action.name }

    case 'sample/loaded':
      return {
        ...state,
        subjects: [...state.subjects, ...action.subjects],
        tasks: [...state.tasks, ...action.tasks],
      }

    case 'data/cleared':
      return { subjects: [], tasks: [], userName: action.defaultUserName }

    case 'data/replaced':
      return action.state
  }
}
