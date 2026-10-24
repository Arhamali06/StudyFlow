import { useContext } from 'react'
import { ToastContext, type ToastContextValue } from '../context/ToastContext'

/** `const { showToast } = useToast()` then `showToast('Saved')` or `showToast('Oops', 'error')`. */
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used inside <ToastProvider>.')
  }
  return context
}
