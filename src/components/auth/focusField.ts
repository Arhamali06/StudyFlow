/** Moves keyboard focus to a field (used to jump to the first invalid input after a failed submit). */
export function focusField(id: string) {
  document.getElementById(id)?.focus()
}
