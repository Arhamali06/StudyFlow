import { SUBJECT_COLORS } from './constants'
import type { Subject } from '../types'

/** True if another subject already uses this name (ignoring case and extra spaces). */
export function isSubjectNameTaken(subjects: Subject[], name: string, ignoreId?: string): boolean {
  const wanted = name.trim().toLowerCase()
  return subjects.some((subject) => subject.id !== ignoreId && subject.name.trim().toLowerCase() === wanted)
}

/** Suggests the first palette color that no subject is using yet. */
export function pickUnusedColor(subjects: Subject[]): string {
  const used = new Set(subjects.map((subject) => subject.color.toLowerCase()))
  const free = SUBJECT_COLORS.find((color) => !used.has(color.value))
  return (free ?? SUBJECT_COLORS[subjects.length % SUBJECT_COLORS.length]).value
}
