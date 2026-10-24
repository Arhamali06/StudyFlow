/**
 * Creates a unique id for a task or subject.
 * `crypto.randomUUID` only exists on secure pages (https or localhost), so we
 * fall back to a random string when testing over plain http on a phone.
 */
export function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}
