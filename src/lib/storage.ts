import { DEFAULT_THEME, THEME_PREFERENCES } from './constants'
import type { ThemePreference } from '../types'

const THEME_KEY = 'studyflow:v1:theme'

export const STORAGE_KEYS = {
  theme: THEME_KEY,
} as const

function getStorage(): Storage | null {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

export function loadTheme(): ThemePreference {
  try {
    const raw = getStorage()?.getItem(THEME_KEY)
    return THEME_PREFERENCES.includes(raw as ThemePreference) ? raw as ThemePreference : DEFAULT_THEME
  } catch {
    return DEFAULT_THEME
  }
}

export function saveTheme(theme: ThemePreference): boolean {
  try {
    const storage = getStorage()
    if (!storage) return false
    storage.setItem(THEME_KEY, theme)
    return true
  } catch {
    return false
  }
}
