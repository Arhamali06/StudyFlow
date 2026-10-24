import { createContext, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { CircleAlert, CircleCheck, Info, X } from 'lucide-react'

export type ToastTone = 'success' | 'error' | 'info'

interface Toast {
  id: number
  message: string
  tone: ToastTone
}

export interface ToastContextValue {
  showToast: (message: string, tone?: ToastTone) => void
}

// The context object lives next to its provider; hooks/ re-expose it.
// eslint-disable-next-line react-refresh/only-export-components
export const ToastContext = createContext<ToastContextValue | null>(null)

const TOAST_DURATION_MS = 4000
const TOAST_ICONS = { success: CircleCheck, error: CircleAlert, info: Info } as const

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(1)
  const timers = useRef(new Map<number, number>())

  const dismiss = useCallback((id: number) => {
    window.clearTimeout(timers.current.get(id))
    timers.current.delete(id)
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback<ToastContextValue['showToast']>(
    (message, tone = 'success') => {
      const id = nextId.current++
      // Keep at most 3 on screen: drop the oldest first.
      setToasts((current) => [...current.slice(-2), { id, message, tone }])
      timers.current.set(id, window.setTimeout(() => dismiss(id), TOAST_DURATION_MS))
    },
    [dismiss],
  )

  // Clear pending timers if the provider ever unmounts.
  useEffect(() => {
    const activeTimers = timers.current
    return () => activeTimers.forEach((timer) => window.clearTimeout(timer))
  }, [])

  const value = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-viewport" role="status" aria-live="polite">
        {toasts.map((toast) => {
          const Icon = TOAST_ICONS[toast.tone]
          return (
            <div key={toast.id} className={`toast toast--${toast.tone}`}>
              <Icon size={20} aria-hidden="true" />
              <p className="toast__message">{toast.message}</p>
              <button
                type="button"
                className="toast__close"
                onClick={() => dismiss(toast.id)}
                aria-label="Dismiss message"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
