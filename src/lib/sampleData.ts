import { addDays, toDateString } from './dates'
import { createId } from './ids'
import type { Subject, Task, TaskPriority, TaskStatus, TaskType } from '../types'

/**
 * Optional demo content so a new user can explore the app.
 * It is never loaded automatically, and every item is marked `isSample: true`.
 * Due dates are relative to today so the demo always has overdue, today and
 * upcoming tasks.
 */

interface SampleSubject {
  name: string
  color: string
}

interface SampleTask {
  title: string
  description: string
  subject: number // index into SAMPLE_SUBJECTS
  type: TaskType
  dueInDays: number // negative = already past
  priority: TaskPriority
  status: TaskStatus
  completedDaysAgo?: number
}

const SAMPLE_SUBJECTS: SampleSubject[] = [
  { name: 'Mathematics', color: '#7b61f5' },
  { name: 'Physics', color: '#3b82f6' },
  { name: 'Literature', color: '#ff9500' },
  { name: 'Computer Science', color: '#22a06b' },
]

const SAMPLE_TASKS: SampleTask[] = [
  { title: 'Calculus problem set 4', description: 'Chapters 4.1 to 4.3, show all working.', subject: 0, type: 'assignment', dueInDays: 2, priority: 'high', status: 'pending' },
  { title: 'Linear algebra quiz', description: '', subject: 0, type: 'quiz', dueInDays: 5, priority: 'medium', status: 'pending' },
  { title: 'Midterm exam', description: 'Covers units 1 to 5.', subject: 0, type: 'exam', dueInDays: 12, priority: 'high', status: 'pending' },
  { title: 'Derivatives revision', description: '', subject: 0, type: 'revision', dueInDays: -1, priority: 'medium', status: 'pending' },
  { title: 'Lab report: pendulum', description: 'Include error analysis and graphs.', subject: 1, type: 'assignment', dueInDays: -3, priority: 'high', status: 'pending' },
  { title: 'Thermodynamics notes', description: '', subject: 1, type: 'revision', dueInDays: 0, priority: 'low', status: 'pending' },
  { title: 'Optics quiz', description: '', subject: 1, type: 'quiz', dueInDays: -4, priority: 'medium', status: 'completed', completedDaysAgo: 5 },
  { title: 'Essay: unreliable narrators', description: '1,500 words, MLA format.', subject: 2, type: 'assignment', dueInDays: 1, priority: 'high', status: 'pending' },
  { title: 'Read chapters 5 to 7', description: '', subject: 2, type: 'other', dueInDays: 0, priority: 'medium', status: 'pending' },
  { title: 'Poetry analysis', description: '', subject: 2, type: 'assignment', dueInDays: -6, priority: 'low', status: 'completed', completedDaysAgo: 7 },
  { title: 'Data structures project', description: 'Implement a linked list and a stack.', subject: 3, type: 'assignment', dueInDays: 7, priority: 'high', status: 'pending' },
  { title: 'Sorting algorithms quiz', description: '', subject: 3, type: 'quiz', dueInDays: -2, priority: 'medium', status: 'completed', completedDaysAgo: 2 },
  { title: 'Binary trees revision', description: '', subject: 3, type: 'revision', dueInDays: 3, priority: 'low', status: 'pending' },
  { title: 'Debugging worksheet', description: '', subject: 3, type: 'assignment', dueInDays: -1, priority: 'low', status: 'completed', completedDaysAgo: 1 },
]

/** Builds fresh sample subjects and tasks (new ids every time). */
export function createSampleData(now: Date = new Date()): { subjects: Subject[]; tasks: Task[] } {
  const subjects: Subject[] = SAMPLE_SUBJECTS.map((subject) => ({
    id: createId(),
    name: subject.name,
    color: subject.color,
    isSample: true,
  }))

  const tasks: Task[] = SAMPLE_TASKS.map((sample, index) => {
    const createdAt = new Date(now.getTime() - (SAMPLE_TASKS.length - index) * 60 * 60 * 1000)

    let completedAt: string | null = null
    if (sample.status === 'completed' && sample.completedDaysAgo !== undefined) {
      const day = addDays(now, -sample.completedDaysAgo)
      completedAt = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 12).toISOString()
    }

    return {
      id: createId(),
      title: sample.title,
      description: sample.description,
      subjectId: subjects[sample.subject].id,
      type: sample.type,
      dueDate: toDateString(addDays(now, sample.dueInDays)),
      priority: sample.priority,
      status: sample.status,
      createdAt: createdAt.toISOString(),
      completedAt,
      isSample: true,
    }
  })

  return { subjects, tasks }
}
