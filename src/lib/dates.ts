/**
 * Date helpers.
 *
 * Due dates are stored as plain "YYYY-MM-DD" strings and always treated as
 * LOCAL calendar days. We never use `new Date("2026-10-23")` because that is
 * parsed as UTC midnight and shows up as the previous day in timezones behind
 * UTC. Building dates from year/month/day numbers avoids that bug.
 */

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/

const pad = (value: number): string => String(value).padStart(2, '0')

/** Date -> "YYYY-MM-DD" using the user's local calendar day. */
export function toDateString(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/** Today's local date as "YYYY-MM-DD". */
export function getTodayString(now: Date = new Date()): string {
  return toDateString(now)
}

/**
 * "YYYY-MM-DD" -> Date at local midnight, or null if it is not a real date
 * (for example "2026-02-30" or "hello").
 */
export function parseDateString(value: string): Date | null {
  const match = DATE_PATTERN.exec(value)
  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(year, month - 1, day)

  const isSameDay =
    date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
  return isSameDay ? date : null
}

export function isValidDateString(value: string): boolean {
  return parseDateString(value) !== null
}

/** True for strings like "2026-10-23T09:30:00.000Z" that JavaScript can read. */
export function isValidTimestamp(value: string): boolean {
  return !Number.isNaN(Date.parse(value))
}

/**
 * Compares two "YYYY-MM-DD" strings. Negative if a is earlier, positive if
 * later, 0 if the same day. (The format sorts correctly as plain text.)
 */
export function compareDateStrings(a: string, b: string): number {
  if (a === b) return 0
  return a < b ? -1 : 1
}

/** Returns a new Date that is `days` days after `date` (negative = before). */
export function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

/**
 * Whole days from `from` to `to` (both "YYYY-MM-DD"). Positive if `to` is
 * later. Uses UTC day numbers so daylight-saving changes can't shift the result.
 */
export function getDayDifference(from: string, to: string): number {
  const start = parseDateString(from)
  const end = parseDateString(to)
  if (!start || !end) return 0

  const startDay = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate())
  const endDay = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate())
  return Math.round((endDay - startDay) / 86_400_000)
}

/** "2026-10-23" -> "Fri, Oct 23" (the year is added when it isn't the current year). */
export function formatDate(value: string, now: Date = new Date()): string {
  const date = parseDateString(value)
  if (!date) return value

  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() === now.getFullYear() ? undefined : 'numeric',
  })
}
