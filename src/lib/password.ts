/** 1 = too weak to submit, 2 = acceptable (8+ chars and a number), 3 = strong. */
export function passwordStrength(password: string) {
  if (password.length < 8 || !/\d/.test(password)) return 1
  return /[A-Z]/.test(password) && /[^A-Za-z0-9]/.test(password) ? 3 : 2
}

export const STRENGTH_LABELS = ['', 'Weak', 'Good', 'Strong'] as const
