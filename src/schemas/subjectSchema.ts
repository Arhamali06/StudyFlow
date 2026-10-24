import { z } from 'zod'
import { SUBJECT_NAME_MAX_LENGTH } from '../lib/constants'
import type { Subject } from '../types'

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/

/**
 * Describes a valid stored Subject. It is used to:
 *  - validate data read from localStorage, and
 *  - validate every subject before it enters the app state.
 * Phase 3 builds the subject form schema from this one.
 */
export const subjectSchema = z.object({
  id: z.string().min(1),
  name: z
    .string()
    .trim()
    .min(1, 'Subject name is required')
    .max(SUBJECT_NAME_MAX_LENGTH, `Use ${SUBJECT_NAME_MAX_LENGTH} characters or fewer`),
  color: z.string().regex(HEX_COLOR, 'Choose a valid color'),
  isSample: z.boolean().optional(),
}) satisfies z.ZodType<Subject>

/** The fields a person fills in on the subject form. */
export const subjectFormSchema = subjectSchema.pick({ name: true, color: true })

export type SubjectFormValues = z.infer<typeof subjectFormSchema>

/**
 * Same as `subjectFormSchema`, plus a check that the name isn't already used.
 * Pass the names of the OTHER subjects (leave out the one being edited).
 */
export function createSubjectFormSchema(otherNames: string[]) {
  const taken = new Set(otherNames.map((name) => name.trim().toLowerCase()))
  return subjectFormSchema.refine((values) => !taken.has(values.name.trim().toLowerCase()), {
    message: 'You already have a subject with this name',
    path: ['name'],
  })
}
