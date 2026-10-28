/** Demo-only authentication seam. Replace these values and helpers with API calls later. */
export const AUTH_CONFIG = {
  email: 'admin123@gmail.com',
  password: 'admin123',
  storageKey: 'studyflow-authenticated',
} as const

export const EMAIL_PATTERN = /^\S+@\S+\.\S+$/

function readFlag(storage: Storage) {
  try {
    return storage.getItem(AUTH_CONFIG.storageKey) === 'true'
  } catch {
    return false
  }
}

export function isAuthenticated() {
  return readFlag(localStorage) || readFlag(sessionStorage)
}

/** Checks the demo credentials. Swap this for an API call when a backend exists. */
export function checkCredentials(email: string, password: string) {
  return email.trim().toLowerCase() === AUTH_CONFIG.email && password === AUTH_CONFIG.password
}

export function setAuthenticated(remember: boolean) {
  // Clear first so an older "remember me" flag can never outlive a session-only login.
  clearAuthentication()
  try {
    ;(remember ? localStorage : sessionStorage).setItem(AUTH_CONFIG.storageKey, 'true')
  } catch {
    /* Storage can be blocked (private mode). The user simply stays logged out. */
  }
}

export function clearAuthentication() {
  try {
    localStorage.removeItem(AUTH_CONFIG.storageKey)
    sessionStorage.removeItem(AUTH_CONFIG.storageKey)
  } catch {
    /* ignore */
  }
}
