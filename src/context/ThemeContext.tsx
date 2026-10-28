import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { loadTheme, saveTheme, STORAGE_KEYS } from '../lib/storage'
import { useToast } from '../hooks/useToast'
import type { ResolvedTheme, ThemeContextValue, ThemePreference } from '../types'

// The context object lives next to its provider; hooks/ re-expose it.
// eslint-disable-next-line react-refresh/only-export-components
export const ThemeContext = createContext<ThemeContextValue | null>(null)

const DARK_QUERY = '(prefers-color-scheme: dark)'

function systemPrefersDark(): boolean {
  return typeof window !== 'undefined' && window.matchMedia(DARK_QUERY).matches
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemePreference>(loadTheme)
  const [isSystemDark, setIsSystemDark] = useState(systemPrefersDark)
  const { showToast } = useToast()

  // Always track the operating system setting, even while Light or Dark is chosen.
  // Otherwise switching to "System" later would use an outdated value.
  useEffect(() => {
    const query = window.matchMedia(DARK_QUERY)
    const handleChange = (event: MediaQueryListEvent) => setIsSystemDark(event.matches)
    query.addEventListener('change', handleChange)
    return () => query.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEYS.theme) return
      setThemeState(loadTheme())
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const resolvedTheme: ResolvedTheme =
    theme === 'system' ? (isSystemDark ? 'dark' : 'light') : theme

  // Apply the theme to <html data-theme="...">. tokens.css reads this attribute.
  useEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme
    document.documentElement.style.colorScheme = resolvedTheme
    // Use the real frame colour from the design tokens so the browser UI always matches.
    const frameColor = getComputedStyle(document.documentElement).getPropertyValue('--color-frame').trim()
    document.querySelector('meta[name="theme-color"]')?.setAttribute(
      'content',
      frameColor || (resolvedTheme === 'dark' ? '#101013' : '#ffffff'),
    )
  }, [resolvedTheme])

  const setTheme = useCallback((next: ThemePreference) => {
    setThemeState(next)
    if (!saveTheme(next)) showToast('Theme preference could not be saved.', 'error')
  }, [showToast])

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
