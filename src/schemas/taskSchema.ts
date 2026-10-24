import { z } from 'zod'
import {
  TASK_DESCRIPTION_MAX_LENGTH,
  TASK_PRIORITIES,
  TASK_STATUSES,
  TASK_TITLE_MAX_LENGTH,
  TASK_TYPES,
} from '../lib/constants'
import { isValidDateString, isValidTimestamp } from '../lib/dates'
import type { Task } from '../types'

const timestamp = z.string().refine(isValidTimestamp, 'Invalid timestamp')

/**
 * Describes a valid stored Task. It is used to:
 *  - validate data read from localStorage, and
 *  - validate every task before it enters the app state.
 * Phase 4 builds the task form schema from this one.
 */
export const taskSchema = z.object({
  id: z.string().min(1),
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(TASK_TITLE_MAX_LENGTH, `Use ${TASK_TITLE_MAX_LENGTH} characters or fewer`),
  description: z
    .string()
    .trim()
    .max(TASK_DESCRIPTION_MAX_LENGTH, `Use ${TASK_DESCRIPTION_MAX_LENGTH} characters or fewer`)
    .default(''),
  subjectId: z.string().min(1, 'Choose a subject'),
  type: z.enum(TASK_TYPES),
  dueDate: z.string().refine(isValidDateString, 'Enter a valid due date'),
  priority: z.enum(TASK_PRIORITIES),
  status: z.enum(TASK_STATUSES),
  createdAt: timestamp,
  completedAt: timestamp.nullable().default(null),
  isSample: z.boolean().optional(),
}) satisfies z.ZodType<Task>

/** The fields a person fills in on the task form. */
export const taskFormSchema = taskSchema
  .pick({
    title: true,
    subjectId: true,
    type: true,
    priority: true,
    status: true,
  })
  .extend({
    description: z
      .string()
      .trim()
      .max(TASK_DESCRIPTION_MAX_LENGTH, `Use ${TASK_DESCRIPTION_MAX_LENGTH} characters or fewer`),
    dueDate: z
      .string()
      .min(1, 'Due date is required')
      .refine(isValidDateString, 'Enter a valid due date'),
  })

export type TaskFormValues = z.infer<typeof taskFormSchema>
