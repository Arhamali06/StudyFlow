import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { loadTheme, saveTheme } from '../lib/storage'
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

  // Follow the operating system setting while it changes.
  useEffect(() => {
    const query = window.matchMedia(DARK_QUERY)
    const handleChange = (event: MediaQueryListEvent) => setIsSystemDark(event.matches)
    query.addEventListener('change', handleChange)
    return () => query.removeEventListener('change', handleChange)
  }, [])

  const resolvedTheme: ResolvedTheme =
    theme === 'system' ? (isSystemDark ? 'dark' : 'light') : theme

  // Apply the theme to <html data-theme="...">. tokens.css reads this attribute.
  useEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme
  }, [resolvedTheme])

  const setTheme = useCallback((next: ThemePreference) => {
    setThemeState(next)
    saveTheme(next)
  }, [])

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
