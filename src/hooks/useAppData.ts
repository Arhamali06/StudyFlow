import { useContext } from 'react'
import { AppDataContext } from '../context/AppDataContext'
import type { AppDataContextValue } from '../types'

/** Gives any component access to tasks, subjects and the actions that change them. */
export function useAppData(): AppDataContextValue {
  const context = useContext(AppDataContext)
  if (!context) {
    throw new Error('useAppData must be used inside <AppDataProvider>.')
  }
  return context
}
