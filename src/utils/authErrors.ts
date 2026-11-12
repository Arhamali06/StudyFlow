export function getFriendlyAuthError(message: string | null | undefined): string {
  const normalized = (message ?? '').toLowerCase()
  if (normalized.includes('invalid login') || normalized.includes('invalid credentials') || normalized.includes('invalid password')) return 'Incorrect password.'
  if (normalized.includes('auth session missing') || normalized.includes('no session') || normalized.includes('session missing')) return 'Your session has expired. Please sign in again.'
  if (normalized.includes('rate limit') || normalized.includes('too many') || normalized.includes('429')) return 'Too many attempts. Please try again in a few minutes.'
  if (normalized.includes('network') || normalized.includes('fetch') || normalized.includes('failed to fetch')) return "Can't reach the server. Check your connection and try again."
  if (normalized.includes('invalid email') || normalized.includes('email address is invalid') || normalized.includes('email address') && normalized.includes('is invalid') || normalized.includes('email_invalid')) return 'Enter a valid email address.'
  if (normalized.includes('already registered') || normalized.includes('already in use') || normalized.includes('email_exists') || normalized.includes('duplicate')) return 'That email address is already in use.'
  if (normalized.includes('weak_password') || normalized.includes('password') && normalized.includes('weak')) return 'Choose a stronger password.'
  if (normalized.includes('same_password') || normalized.includes('same password')) return 'Your new password must be different from the current one.'
  return 'Something went wrong. Please try again.'
}
