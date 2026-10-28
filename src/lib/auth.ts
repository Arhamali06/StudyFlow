/** Demo-only authentication seam. Replace these values and helpers with API calls later. */
export const AUTH_CONFIG = {
  email: 'admin123@gmail.com',
  password: 'admin123',
  storageKey: 'studyflow-authenticated',
} as const

export function isAuthenticated() {
  return localStorage.getItem(AUTH_CONFIG.storageKey) === 'true' || sessionStorage.getItem(AUTH_CONFIG.storageKey) === 'true'
}

export function setAuthenticated(remember: boolean) {
  const storage = remember ? localStorage : sessionStorage
  storage.setItem(AUTH_CONFIG.storageKey, 'true')
}

export function clearAuthentication() {
  localStorage.removeItem(AUTH_CONFIG.storageKey)
  sessionStorage.removeItem(AUTH_CONFIG.storageKey)
}
