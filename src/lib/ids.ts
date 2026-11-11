/**
 * Creates a unique id for a task or subject.
 * `crypto.randomUUID` only exists on secure pages (https or localhost), so we
 * fall back to a UUID-shaped value when testing over plain http on a phone.
 */
export function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  const hex = () => Math.floor(Math.random() * 0x100000000).toString(16).padStart(8, '0')
  return `${hex()}-${hex().slice(0, 4)}-4${hex().slice(0, 3)}-8${hex().slice(0, 3)}-${hex()}${hex().slice(0, 4)}`
}
