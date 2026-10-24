import { useContext } from 'react'
import { ThemeContext } from '../context/ThemeContext'
import type { ThemeContextValue } from '../types'

/** Gives any component the current theme and a function to change it. */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used inside <ThemeProvider>.')
  }
  return context
}
